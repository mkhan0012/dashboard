export type ClassifiedEmail = {
    company: string;
    role: string;
    status: 'APPLIED' | 'INTERVIEW' | 'REJECTED' | 'OFFER';
    subject: string;
    snippet: string;
    threadId: string;
    date: Date;
  };
  
  // Helper to clean strings
  const cleanText = (text: string) => text ? text.replace(/['"]/g, "").trim() : "";
  
  export function classifyEmail(emailData: any): ClassifiedEmail | null {
    const headers = emailData.payload.headers;
    
    // 1. Extract Basic Fields
    const subject = cleanText(headers.find((h: any) => h.name === 'Subject')?.value || '');
    const from = cleanText(headers.find((h: any) => h.name === 'From')?.value || '');
    const snippet = cleanText(emailData.snippet);
    const dateStr = headers.find((h: any) => h.name === 'Date')?.value;
    const date = dateStr ? new Date(dateStr) : new Date();
  
    // 2. Filter: Is this a job-related email?
    const jobKeywords = [
      'application', 'hiring', 'interview', 'recruiting', 'talent', 
      'career', 'position', 'job', 'candidacy', 'resume', 'cv'
    ];
    
    const contentToScan = (subject + " " + snippet).toLowerCase();
    const fromToScan = from.toLowerCase();
    
    const isJobRelated = jobKeywords.some(k => contentToScan.includes(k) || fromToScan.includes(k));
  
    if (!isJobRelated) return null;
  
    // 3. Extract Company Name (Heuristic)
    // Format is usually "Recruiter Name <email>" or "Company Name <no-reply@company.com>"
    let company = from.split('<')[0].trim();
    // Remove common generic prefixes if present
    company = company.replace(/Recruiting|Team|Careers|Talent|Acquisition|HR/gi, '').trim();
    if (company.length < 2) company = "Unknown Company";
  
    // 4. Extract Role (Heuristic)
    // Look for "for [Role]" or "[Role] Application"
    let role = "Unknown Role";
    const forMatch = subject.match(/for\s+(.+?)(\s+at\s+|$|\-)/i);
    if (forMatch && forMatch[1]) {
      role = forMatch[1].trim();
    }
  
    // 5. Determine Status
    let status: ClassifiedEmail['status'] = 'APPLIED';
    const lowerSnippet = snippet.toLowerCase();
    const lowerSubject = subject.toLowerCase();
  
    if (
      lowerSnippet.includes('unfortunately') || 
      lowerSnippet.includes('regret to inform') || 
      lowerSnippet.includes('not moving forward') ||
      lowerSnippet.includes('not be proceeding')
    ) {
      status = 'REJECTED';
    } else if (
      lowerSubject.includes('interview') || 
      lowerSnippet.includes('schedule a time') || 
      lowerSnippet.includes('availability') ||
      lowerSnippet.includes('phone screen')
    ) {
      status = 'INTERVIEW';
    } else if (
      lowerSubject.includes('offer') || 
      lowerSnippet.includes('congratulations! we would like to offer')
    ) {
      status = 'OFFER';
    }
  
    return {
      company,
      role,
      status,
      subject,
      snippet,
      threadId: emailData.threadId,
      date
    };
  }