import { supabaseAdmin } from '../config';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { AuthenticatedUser } from '../types';
import { ApiError } from '../middleware';
import { Request } from 'express';

interface MergeResult {
  masterIssue: unknown;
  mergedCount: number;
  affectedReporters: string[];
}

/**
 * Duplicate Merge Service
 * Handles merging duplicate issues into a master issue
 */
export class DuplicateMergeService {
  /**
   * Merge duplicate issues into a master issue
   * 
   * Process:
   * 1. Validate master and duplicate issues exist
   * 2. Collect all reporters from duplicate issues
   * 3. Update master issue with combined data
   * 4. Close duplicate issues with reference to master
   * 5. Create audit logs
   * 6. Notify all affected reporters
   */
  static async mergeIssues(
    user: AuthenticatedUser,
    masterIssueId: string,
    duplicateIssueIds: string[],
    mergeNotes?: string,
    req?: Request
  ): Promise<MergeResult> {
    // Validate user is staff
    if (user.role !== 'caretaker' && user.role !== 'admin') {
      throw new ApiError('Only staff can merge issues', 403);
    }

    // Remove master issue from duplicates if accidentally included
    const cleanDuplicateIds = duplicateIssueIds.filter((id) => id !== masterIssueId);

    if (cleanDuplicateIds.length === 0) {
      throw new ApiError('At least one duplicate issue is required', 400);
    }

    // Fetch master issue
    const { data: masterIssue, error: masterError } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('id', masterIssueId)
      .single();

    if (masterError || !masterIssue) {
      throw new ApiError('Master issue not found', 404);
    }

    if (masterIssue.status === 'closed') {
      throw new ApiError('Cannot merge into a closed issue', 400);
    }

    // Fetch duplicate issues
    const { data: duplicateIssues, error: duplicatesError } = await supabaseAdmin
      .from('issues')
      .select('*')
      .in('id', cleanDuplicateIds);

    if (duplicatesError || !duplicateIssues || duplicateIssues.length === 0) {
      throw new ApiError('No valid duplicate issues found', 404);
    }

    // Collect all unique reporters from duplicates
    const affectedReporters = new Set<string>();
    duplicateIssues.forEach((issue) => {
      affectedReporters.add(issue.reported_by);
    });
    // Remove master issue reporter from affected (they'll get a different notification)
    affectedReporters.delete(masterIssue.reported_by);

    // Combine notes from all issues
    const combinedNotes = this.combineNotes(masterIssue, duplicateIssues, mergeNotes);

    // Combine images from all issues
    const combinedImages = this.combineImages(masterIssue, duplicateIssues);

    // Update master issue
    const { error: updateError } = await supabaseAdmin
      .from('issues')
      .update({
        notes: combinedNotes,
        images: combinedImages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', masterIssueId);

    if (updateError) {
      throw new ApiError(`Failed to update master issue: ${updateError.message}`, 500);
    }

    // Close all duplicate issues
    const { error: closeError } = await supabaseAdmin
      .from('issues')
      .update({
        status: 'closed',
        notes: `Merged into issue: ${masterIssueId}. Original notes preserved in master issue.`,
        updated_at: new Date().toISOString(),
      })
      .in('id', cleanDuplicateIds);

    if (closeError) {
      throw new ApiError(`Failed to close duplicate issues: ${closeError.message}`, 500);
    }

    // Create audit log for the merge
    await AuditService.logIssueMerge(user, masterIssueId, cleanDuplicateIds, req);

    // Notify affected reporters about the merge
    const reporterArray = Array.from(affectedReporters);
    if (reporterArray.length > 0) {
      await NotificationService.notifyIssueMerge(
        reporterArray,
        masterIssueId,
        masterIssue.title
      );
    }

    // Also notify master issue reporter if different from merger
    if (masterIssue.reported_by !== user.id) {
      await NotificationService.create({
        userId: masterIssue.reported_by,
        title: 'Issues Merged Into Your Report',
        message: `${duplicateIssues.length} duplicate issue(s) have been merged into your issue "${masterIssue.title}".`,
        type: 'issue',
        referenceId: masterIssueId,
        referenceType: 'issue',
      });
    }

    // Fetch updated master issue
    const { data: updatedMaster } = await supabaseAdmin
      .from('issues')
      .select('*, reporter:users!reported_by(full_name, email), assignee:users!assigned_to(full_name, email)')
      .eq('id', masterIssueId)
      .single();

    return {
      masterIssue: updatedMaster,
      mergedCount: duplicateIssues.length,
      affectedReporters: reporterArray,
    };
  }

  /**
   * Combine notes from all issues
   */
  private static combineNotes(
    masterIssue: { notes?: string; title: string; id: string },
    duplicateIssues: Array<{ notes?: string; title: string; id: string; reported_by: string }>,
    mergeNotes?: string
  ): string {
    const parts: string[] = [];

    // Original master issue notes
    if (masterIssue.notes) {
      parts.push(`[Original Notes]\n${masterIssue.notes}`);
    }

    // Merge notes
    if (mergeNotes) {
      parts.push(`[Merge Notes - ${new Date().toISOString()}]\n${mergeNotes}`);
    }

    // Notes from merged issues
    const mergedNotes: string[] = [];
    duplicateIssues.forEach((issue) => {
      if (issue.notes) {
        mergedNotes.push(`Issue "${issue.title}" (${issue.id}): ${issue.notes}`);
      }
    });

    if (mergedNotes.length > 0) {
      parts.push(`[Merged Issue Notes]\n${mergedNotes.join('\n\n')}`);
    }

    // Summary of merged issues
    parts.push(
      `[Merge Summary]\nMerged ${duplicateIssues.length} duplicate issue(s) on ${new Date().toISOString()}:\n` +
        duplicateIssues.map((i) => `- ${i.title} (${i.id})`).join('\n')
    );

    return parts.join('\n\n---\n\n');
  }

  /**
   * Combine images from all issues (deduplicates)
   */
  private static combineImages(
    masterIssue: { images?: string[] },
    duplicateIssues: Array<{ images?: string[] }>
  ): string[] {
    const allImages = new Set<string>();

    // Add master issue images
    if (masterIssue.images) {
      masterIssue.images.forEach((img) => allImages.add(img));
    }

    // Add duplicate issue images
    duplicateIssues.forEach((issue) => {
      if (issue.images) {
        issue.images.forEach((img) => allImages.add(img));
      }
    });

    // Limit to 10 images
    return Array.from(allImages).slice(0, 10);
  }

  /**
   * Find potential duplicate issues based on similarity
   * Uses title and description matching
   */
  static async findPotentialDuplicates(
    issueId: string,
    options: { limit?: number } = {}
  ): Promise<unknown[]> {
    const limit = options.limit || 5;

    // Fetch the issue to find duplicates for
    const { data: issue, error: issueError } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('id', issueId)
      .single();

    if (issueError || !issue) {
      throw new ApiError('Issue not found', 404);
    }

    // Find issues with similar properties
    // This is a basic similarity search - can be enhanced with full-text search
    const { data: potentialDuplicates, error: searchError } = await supabaseAdmin
      .from('issues')
      .select('*, reporter:users!reported_by(full_name, email)')
      .neq('id', issueId)
      .eq('category', issue.category)
      .eq('hostel_name', issue.hostel_name)
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (searchError) {
      throw new ApiError(`Failed to search for duplicates: ${searchError.message}`, 500);
    }

    return potentialDuplicates || [];
  }
}

export default DuplicateMergeService;
