import analyticsService from './AnalyticsService.js';

/**
 * PDF Report generation service
 * Uses browser print functionality with formatted HTML
 */
class PDFService {
    /**
     * Generate and download progress report
     */
    generateProgressReport() {
        const data = analyticsService.getDashboardData();
        const html = this.buildReportHTML(data);
        this.printReport(html);
    }
    
    /**
     * Build HTML for the report
     */
    buildReportHTML(data) {
        const date = new Date().toLocaleDateString('en', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Aphasia Recovery Progress Report</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #333;
            padding: 20mm;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #4A90D9;
        }
        .header h1 {
            color: #4A90D9;
            font-size: 24pt;
            margin-bottom: 5px;
        }
        .header .date {
            color: #666;
        }
        .section {
            margin: 20px 0;
            page-break-inside: avoid;
        }
        .section h2 {
            color: #4A90D9;
            font-size: 14pt;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ddd;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 15px 0;
        }
        .stat-box {
            text-align: center;
            padding: 15px;
            background: #f5f7fa;
            border-radius: 8px;
        }
        .stat-value {
            font-size: 20pt;
            font-weight: bold;
            color: #4A90D9;
        }
        .stat-label {
            font-size: 10pt;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }
        th, td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f5f7fa;
            font-weight: 600;
        }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: #4A90D9;
        }
        .word-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .word-tag {
            padding: 4px 12px;
            background: #f5f7fa;
            border-radius: 20px;
            font-size: 10pt;
        }
        .word-tag.problem {
            background: #f2dede;
            color: #d9534f;
        }
        .word-tag.mastered {
            background: #dff0d8;
            color: #5cb85c;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 10pt;
            color: #666;
        }
        @media print {
            body { padding: 15mm; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Progress Report</h1>
        <div class="date">Generated: ${date}</div>
    </div>
    
    <div class="section">
        <h2>📊 Overall Summary</h2>
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-value">${data.allTime.daysActive}</div>
                <div class="stat-label">Days Active</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${data.allTime.totalPracticeTimeFormatted}</div>
                <div class="stat-label">Total Practice Time</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${data.allTime.overallAccuracy}%</div>
                <div class="stat-label">Overall Accuracy</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${data.allTime.wordsMastered}</div>
                <div class="stat-label">Words Mastered</div>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>🔥 Current Streak</h2>
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-value">${data.streak.current}</div>
                <div class="stat-label">Current Streak (days)</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${data.streak.longest}</div>
                <div class="stat-label">Longest Streak (days)</div>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>📅 This Week</h2>
        <table>
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Words</th>
                    <th>Accuracy</th>
                </tr>
            </thead>
            <tbody>
                ${data.week.days.map(day => `
                    <tr>
                        <td>${day.dayName}</td>
                        <td>${analyticsService.formatDuration(day.totalTime)}</td>
                        <td>${day.totalAttempts || 0}</td>
                        <td>
                            ${day.totalAttempts > 0 
                                ? Math.round((day.totalCorrect / day.totalAttempts) * 100) + '%'
                                : '-'
                            }
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>📝 Exercise Performance</h2>
        <table>
            <thead>
                <tr>
                    <th>Exercise Type</th>
                    <th>Sessions</th>
                    <th>Accuracy</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(data.exerciseBreakdown).map(([type, stats]) => `
                    <tr>
                        <td>${this.formatExerciseType(type)}</td>
                        <td>${stats.sessions}</td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div class="progress-bar" style="width: 100px;">
                                    <div class="progress-fill" style="width: ${stats.accuracy}%;"></div>
                                </div>
                                ${stats.accuracy}%
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    
    ${data.problemWords.length > 0 ? `
    <div class="section">
        <h2>⚠️ Words Needing Practice</h2>
        <div class="word-list">
            ${data.problemWords.map(w => `
                <span class="word-tag problem">${w.word} (${w.accuracy}%)</span>
            `).join('')}
        </div>
    </div>
    ` : ''}
    
    ${data.masteredWords.length > 0 ? `
    <div class="section">
        <h2>✓ Mastered Words</h2>
        <div class="word-list">
            ${data.masteredWords.map(w => `
                <span class="word-tag mastered">${w.word}</span>
            `).join('')}
        </div>
    </div>
    ` : ''}
    
    <div class="footer">
        <p>Aphasia Recovery Tool - Progress Report</p>
        <p>Keep up the great work! Consistent practice leads to improvement.</p>
    </div>
</body>
</html>
        `;
    }
    
    /**
     * Open print dialog with report
     */
    printReport(html) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
            printWindow.print();
        };
    }
    
    /**
     * Format exercise type name
     */
    formatExerciseType(type) {
        const names = {
            naming: 'Picture Naming',
            listening: 'Listening',
            speaking: 'Speaking',
            typing: 'Word Typing',
            sentenceTyping: 'Sentence Completion',
            category: 'Categories',
            rhyming: 'Rhyming',
            firstSound: 'First Sounds',
            association: 'Word Association',
            synonyms: 'Synonyms/Antonyms',
            definitions: 'Definitions',
            scramble: 'Sentence Scramble'
        };
        return names[type] || type;
    }
}

export const pdfService = new PDFService();
export default pdfService;