/**
 * Email Module
 * Handles sending reports via EmailJS
 * 
 * Setup required:
 * 1. Create account at emailjs.com
 * 2. Create email service (Gmail, Outlook, etc.)
 * 3. Create email template
 * 4. Get Service ID, Template ID, and Public Key
 */
const Email = {
    // These should be configured in Settings or via environment
    config: {
        serviceId: '', // e.g., 'service_abc123'
        templateId: '', // e.g., 'template_xyz789'
        publicKey: ''  // e.g., 'user_abc123xyz'
    },
    
    initialized: false,
    
    /**
     * Initialize EmailJS SDK
     */
    init() {
        const settings = Settings.get();
        
        if (settings.emailjsPublicKey) {
            this.config.publicKey = settings.emailjsPublicKey;
            this.config.serviceId = settings.emailjsServiceId || '';
            this.config.templateId = settings.emailjsTemplateId || '';
            
            // Load EmailJS SDK if not already loaded
            if (!window.emailjs && this.config.publicKey) {
                this.loadSDK();
            }
        }
    },
    
    /**
     * Load EmailJS SDK dynamically
     */
    loadSDK() {
        return new Promise((resolve, reject) => {
            if (window.emailjs) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                emailjs.init(this.config.publicKey);
                this.initialized = true;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    
    /**
     * Send a progress report email
     */
    async sendReport(recipientEmail, reportType = 'weekly') {
        if (!this.config.serviceId || !this.config.templateId) {
            throw new Error('Email service not configured. Please set up EmailJS in Settings.');
        }
        
        await this.loadSDK();
        
        const reportContent = reportType === 'weekly' 
            ? this.generateWeeklyReport()
            : this.generateSessionReport();
        
        const templateParams = {
            to_email: recipientEmail,
            to_name: recipientEmail.split('@')[0],
            from_name: 'WordBridge',
            report_type: reportType === 'weekly' ? 'Weekly Progress Report' : 'Session Report',
            report_content: reportContent.text,
            report_html: reportContent.html,
            practice_time: reportContent.practiceTime,
            sessions_count: reportContent.sessionsCount,
            average_score: reportContent.avgScore,
            streak: Progress.state.streak
        };
        
        try {
            const response = await emailjs.send(
                this.config.serviceId,
                this.config.templateId,
                templateParams
            );
            
            console.log('Email sent:', response);
            return { success: true, response };
        } catch (error) {
            console.error('Email error:', error);
            throw error;
        }
    },
    
    /**
     * Generate weekly report content
     */
    generateWeeklyReport() {
        const summary = Reports.getWeeklySummary();
        const progress = Progress.state;
        const reviewStats = Review.getStats();
        
        const text = `
WordBridge Weekly Progress Report
=================================

Week Summary
------------
• Sessions Completed: ${summary.totalSessions}
• Total Practice Time: ${summary.formattedTime}
• Days Active: ${summary.daysActive}/7
• Average Score: ${summary.avgScore}%

Current Progress
----------------
• Level: ${progress.level}
• Current Streak: ${progress.streak} days
• Total XP: ${progress.xp}

Words in Review
---------------
• Total words needing practice: ${reviewStats.totalWords}

Keep up the great work!
        `.trim();
        
        const html = `
            <h2 style="color: #4a90d9;">Weekly Progress Report</h2>
            
            <h3>Week Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">Sessions Completed</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${summary.totalSessions}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">Practice Time</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${summary.formattedTime}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">Days Active</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${summary.daysActive}/7</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">Average Score</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${summary.avgScore}%</td>
                </tr>
            </table>
            
            <h3 style="margin-top: 20px;">Current Progress</h3>
            <p>
                <strong>Level ${progress.level}</strong> • 
                ${progress.streak} day streak 🔥 • 
                ${reviewStats.totalWords} words in review
            </p>
            
            <p style="margin-top: 20px; color: #666;">
                Keep up the great work! Consistent practice is the key to recovery.
            </p>
        `;
        
        return {
            text,
            html,
            practiceTime: summary.formattedTime,
            sessionsCount: summary.totalSessions,
            avgScore: summary.avgScore
        };
    },
    
    /**
     * Generate session report content
     */
    generateSessionReport() {
        const sessions = Storage.get('sessions', []);
        const lastSession = sessions[sessions.length - 1];
        
        if (!lastSession) {
            return {
                text: 'No recent sessions to report.',
                html: '<p>No recent sessions to report.</p>',
                practiceTime: '0:00',
                sessionsCount: 0,
                avgScore: 0
            };
        }
        
        const text = `
Latest Practice Session
=======================
Type: ${lastSession.type}
Score: ${lastSession.score}%
Time: ${lastSession.formattedTime}
XP Earned: +${lastSession.xpEarned}
        `.trim();
        
        const html = `
            <h2 style="color: #4a90d9;">Practice Session Complete!</h2>
            <p>
                <strong>${lastSession.type}</strong> - Level ${lastSession.difficulty}
            </p>
            <p style="font-size: 2em; color: #4a90d9; font-weight: bold;">
                ${lastSession.score}%
            </p>
            <p>
                Time: ${lastSession.formattedTime} • 
                XP: +${lastSession.xpEarned}
            </p>
        `;
        
        return {
            text,
            html,
            practiceTime: lastSession.formattedTime,
            sessionsCount: 1,
            avgScore: lastSession.score
        };
    },
    
    /**
     * Open mailto link as fallback
     */
    sendViaMailto(recipientEmail, reportType = 'weekly') {
        const report = reportType === 'weekly'
            ? this.generateWeeklyReport()
            : this.generateSessionReport();
        
        const subject = encodeURIComponent(`WordBridge ${reportType === 'weekly' ? 'Weekly' : 'Session'} Report`);
        const body = encodeURIComponent(report.text);
        
        window.open(`mailto:${recipientEmail}?subject=${subject}&body=${body}`);
    }
};