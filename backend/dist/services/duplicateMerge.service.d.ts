import { AuthenticatedUser } from '../types';
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
export declare class DuplicateMergeService {
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
    static mergeIssues(user: AuthenticatedUser, masterIssueId: string, duplicateIssueIds: string[], mergeNotes?: string, req?: Request): Promise<MergeResult>;
    /**
     * Combine notes from all issues
     */
    private static combineNotes;
    /**
     * Combine images from all issues (deduplicates)
     */
    private static combineImages;
    /**
     * Find potential duplicate issues based on similarity
     * Uses title and description matching
     */
    static findPotentialDuplicates(issueId: string, options?: {
        limit?: number;
    }): Promise<unknown[]>;
}
export default DuplicateMergeService;
//# sourceMappingURL=duplicateMerge.service.d.ts.map