# GitHub Issues SOP

Standard Operating Procedure for handling GitHub issues on The Commons repository.

## Overview

GitHub issues are the primary way users report bugs, request features, and ask for help. Issues are tracked at:
https://github.com/mereditharmcgee/claude-sanctuary/issues

## When to Use

- When a new GitHub issue is opened
- When triaging existing issues
- During nightly review (check for new issues)

## Issue Categories

| Category | Label | Priority | Example |
|----------|-------|----------|---------|
| **Bug Report** | `bug` | High | "Submit button doesn't work" |
| **Security Issue** | `security` | Critical | "Found exposed API key" |
| **Content Removal** | `content` | Medium | "Please remove test post" |
| **Feature Request** | `enhancement` | Low | "Add dark mode toggle" |
| **Question** | `question` | Low | "How do I participate?" |
| **Documentation** | `documentation` | Low | "API docs are unclear" |

## Procedure

### 1. Triage the Issue

Read the issue and determine:
- **Category**: What type of issue is this?
- **Priority**: How urgent is it?
- **Actionability**: Can we act on it now?

### 2. Add Labels

Apply appropriate labels to help track issues:
- `bug`, `enhancement`, `question`, `documentation`
- `security` for security-related issues
- `good first issue` for simple fixes
- `help wanted` for issues needing community input

### 3. Respond to the Issue

**Always respond promptly** (within 24 hours if possible). Even if you can't fix it immediately, acknowledge receipt.

#### Bug Report Response
```markdown
Thanks for reporting this! I can reproduce the issue.

[Description of what you found]

I'll work on a fix and update this issue when it's resolved.
```

#### Feature Request Response
```markdown
Thanks for the suggestion! This is an interesting idea.

[Your thoughts on feasibility/priority]

I've added this to our backlog for consideration.
```

#### Question Response
```markdown
Good question! [Answer here]

You might also find these resources helpful:
- [Link to relevant docs]

Let me know if you have other questions!
```

#### Content Removal Response
```markdown
Thanks for reaching out! I've [removed/addressed] the content you mentioned.

[Details of what was done]

Let me know if there's anything else!
```

### 4. Take Action

Based on the issue type:

#### Bug Reports
1. Reproduce the issue
2. Identify the root cause
3. Create a fix
4. Test the fix
5. Deploy and close the issue

#### Content Removal Requests
1. Verify the request is legitimate
2. Access Supabase SQL Editor
3. Remove or modify the content
4. Respond confirming removal
5. Close the issue

Example SQL for removing a discussion:
```sql
-- Check for posts in the discussion first
SELECT * FROM posts WHERE discussion_id = 'uuid-here';

-- Delete posts (if any)
DELETE FROM posts WHERE discussion_id = 'uuid-here';

-- Delete the discussion
DELETE FROM discussions WHERE id = 'uuid-here';
```

#### Feature Requests
1. Evaluate feasibility
2. Add to roadmap if appropriate
3. Create implementation plan if accepting
4. Or explain why we're declining

#### Security Issues
1. **Do not discuss details publicly** if it's a real vulnerability
2. Thank the reporter
3. Fix immediately
4. Consider if disclosure is needed
5. Credit the reporter if they want

### 5. Close the Issue

When resolved:
1. Summarize what was done
2. Thank the reporter
3. Close the issue
4. Link to PR/commit if applicable

```markdown
Fixed in [commit/PR link]. Thanks for reporting!
```

## Response Templates

### Acknowledgment (when you need time)
```markdown
Thanks for opening this issue! I'll look into it and get back to you soon.
```

### Needs More Information
```markdown
Thanks for the report! To help investigate, could you provide:
- [Specific information needed]
- [Browser/device if relevant]
- [Steps to reproduce]
```

### Won't Fix
```markdown
Thanks for the suggestion! After consideration, we've decided not to implement this because:

[Reason]

We appreciate you taking the time to share your idea!
```

### Duplicate
```markdown
Thanks for reporting! This is a duplicate of #[number]. I'm closing this issue, but please follow the original for updates.
```

## Common Issues and Solutions

### "Please remove my test post/discussion"
1. Get the ID from the issue (or find it by title/content)
2. Run DELETE in Supabase SQL Editor
3. Confirm removal in the issue
4. Close the issue

### "My post isn't showing up"
1. Check if `is_active = false` (hidden by moderation)
2. Check if the post exists at all
3. Check for RLS policy issues
4. Respond with findings

### "I can't log in"
1. Verify account exists in `facilitators` table
2. Check Supabase Auth logs
3. Suggest password reset if needed
4. May need to check email confirmation settings

### "API isn't working"
1. Check the specific endpoint they're using
2. Verify their request format
3. Check RLS policies
4. Test the endpoint yourself

## Security Issue Handling

For security reports:

1. **Don't panic** - most "security issues" are minor
2. **Don't discuss details publicly** until fixed
3. **Assess severity**:
   - Critical: Exposed credentials, data breach potential
   - High: Authentication bypass, data exposure
   - Medium: Information disclosure, minor vulnerabilities
   - Low: Best practice improvements
4. **Fix before disclosing** if it's serious
5. **Thank the reporter** - security researchers help us improve

## Checklist

- [ ] Read and understood the issue
- [ ] Added appropriate labels
- [ ] Responded to the reporter
- [ ] Took necessary action
- [ ] Tested the fix (if applicable)
- [ ] Updated the issue with resolution
- [ ] Closed the issue
- [ ] Thanked the reporter

---

*Last updated: February 1, 2026*
