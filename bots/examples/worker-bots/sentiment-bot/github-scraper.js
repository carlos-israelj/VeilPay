import { Octokit } from '@octokit/rest';

/**
 * GitHub activity analyzer for project development sentiment
 * Tracks commits, issues, PRs, and community engagement
 */

export class GitHubScraper {
  constructor(githubToken) {
    this.octokit = new Octokit({
      auth: githubToken || undefined
    });
  }

  /**
   * Analyze GitHub repository activity
   */
  async analyzeRepository(repoUrl) {
    try {
      const { owner, repo } = this.parseRepoUrl(repoUrl);

      if (!owner || !repo) {
        throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo');
      }

      console.log(`  → Analyzing GitHub: ${owner}/${repo}`);

      // Fetch repository data in parallel
      const [repoData, commits, issues, pullRequests, contributors] = await Promise.all([
        this.getRepoInfo(owner, repo),
        this.getRecentCommits(owner, repo),
        this.getIssues(owner, repo),
        this.getPullRequests(owner, repo),
        this.getContributors(owner, repo)
      ]);

      // Calculate development metrics
      const metrics = this.calculateDevelopmentMetrics({
        repoData,
        commits,
        issues,
        pullRequests,
        contributors
      });

      return {
        status: 'success',
        repository: `${owner}/${repo}`,
        repoData,
        activity: {
          commits: commits.length,
          issues: issues.length,
          pullRequests: pullRequests.length,
          contributors: contributors.length
        },
        metrics,
        analyzedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('GitHub analysis error:', error.message);

      if (error.status === 404) {
        return {
          status: 'error',
          error: 'Repository not found',
          message: error.message
        };
      }

      return {
        status: 'error',
        error: 'GitHub API error',
        message: error.message
      };
    }
  }

  /**
   * Get repository information
   */
  async getRepoInfo(owner, repo) {
    const { data } = await this.octokit.repos.get({ owner, repo });

    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      watchers: data.watchers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      pushedAt: data.pushed_at,
      language: data.language,
      license: data.license?.name || 'None'
    };
  }

  /**
   * Get recent commits (last 30 days)
   */
  async getRecentCommits(owner, repo) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    try {
      const { data } = await this.octokit.repos.listCommits({
        owner,
        repo,
        since,
        per_page: 100
      });

      return data.map(commit => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message.split('\n')[0],
        author: commit.commit.author.name,
        date: commit.commit.author.date
      }));

    } catch (error) {
      console.warn('Could not fetch commits:', error.message);
      return [];
    }
  }

  /**
   * Get recent issues
   */
  async getIssues(owner, repo) {
    try {
      const { data } = await this.octokit.issues.listForRepo({
        owner,
        repo,
        state: 'all',
        per_page: 50,
        sort: 'updated',
        direction: 'desc'
      });

      // Filter out pull requests (GitHub API includes PRs in issues)
      const issues = data.filter(issue => !issue.pull_request);

      return issues.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        comments: issue.comments
      }));

    } catch (error) {
      console.warn('Could not fetch issues:', error.message);
      return [];
    }
  }

  /**
   * Get pull requests
   */
  async getPullRequests(owner, repo) {
    try {
      const { data } = await this.octokit.pulls.list({
        owner,
        repo,
        state: 'all',
        per_page: 50,
        sort: 'updated',
        direction: 'desc'
      });

      return data.map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        merged: pr.merged_at !== null,
        createdAt: pr.created_at,
        updatedAt: pr.updated_at
      }));

    } catch (error) {
      console.warn('Could not fetch pull requests:', error.message);
      return [];
    }
  }

  /**
   * Get contributors
   */
  async getContributors(owner, repo) {
    try {
      const { data } = await this.octokit.repos.listContributors({
        owner,
        repo,
        per_page: 50
      });

      return data.map(contributor => ({
        login: contributor.login,
        contributions: contributor.contributions
      }));

    } catch (error) {
      console.warn('Could not fetch contributors:', error.message);
      return [];
    }
  }

  /**
   * Calculate development health metrics
   */
  calculateDevelopmentMetrics(data) {
    const { repoData, commits, issues, pullRequests, contributors } = data;

    let developmentScore = 0;

    // Recent activity score (commits in last 30 days)
    if (commits.length > 50) developmentScore += 30;
    else if (commits.length > 20) developmentScore += 25;
    else if (commits.length > 10) developmentScore += 20;
    else if (commits.length > 5) developmentScore += 15;
    else if (commits.length > 0) developmentScore += 10;

    // Community engagement score
    if (repoData.stars > 1000) developmentScore += 20;
    else if (repoData.stars > 500) developmentScore += 15;
    else if (repoData.stars > 100) developmentScore += 10;
    else if (repoData.stars > 50) developmentScore += 5;

    // Contributor diversity score
    if (contributors.length > 20) developmentScore += 20;
    else if (contributors.length > 10) developmentScore += 15;
    else if (contributors.length > 5) developmentScore += 10;
    else if (contributors.length > 2) developmentScore += 5;

    // Issue management score
    const openIssues = issues.filter(i => i.state === 'open').length;
    const closedIssues = issues.filter(i => i.state === 'closed').length;
    const issueCloseRate = closedIssues / (closedIssues + openIssues) || 0;

    if (issueCloseRate > 0.8) developmentScore += 15;
    else if (issueCloseRate > 0.6) developmentScore += 10;
    else if (issueCloseRate > 0.4) developmentScore += 5;

    // PR merge rate
    const mergedPRs = pullRequests.filter(pr => pr.merged).length;
    const prMergeRate = mergedPRs / pullRequests.length || 0;

    if (prMergeRate > 0.7) developmentScore += 15;
    else if (prMergeRate > 0.5) developmentScore += 10;
    else if (prMergeRate > 0.3) developmentScore += 5;

    // Activity level
    let activityLevel;
    if (commits.length > 50) activityLevel = 'Very Active';
    else if (commits.length > 20) activityLevel = 'Active';
    else if (commits.length > 5) activityLevel = 'Moderate';
    else activityLevel = 'Low';

    return {
      developmentScore: Math.min(developmentScore, 100),
      activityLevel,
      commitsLast30d: commits.length,
      issueCloseRate: (issueCloseRate * 100).toFixed(1) + '%',
      prMergeRate: (prMergeRate * 100).toFixed(1) + '%',
      contributorCount: contributors.length,
      communityEngagement: repoData.stars + repoData.forks
    };
  }

  /**
   * Parse GitHub repository URL
   */
  parseRepoUrl(url) {
    // Support formats:
    // - https://github.com/owner/repo
    // - github.com/owner/repo
    // - owner/repo

    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+)/,
      /^([^\/]+)\/([^\/]+)$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace('.git', '')
        };
      }
    }

    return { owner: null, repo: null };
  }
}
