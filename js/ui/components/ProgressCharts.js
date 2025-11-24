// ui/components/ProgressCharts.js - Updated with i18n
import { t } from '../../core/i18n.js';
import storageService from '../../services/StorageService.js';
import analyticsService from '../../services/AnalyticsService.js';
import assessmentService from '../../services/AssessmentService.js';


class ProgressCharts {
    constructor(container) {
        this.container = container;
    }
    
    render() {
        this.container.innerHTML = `
            <div class="progress-charts">
                <div class="charts-header">
                    <h2>${t('progress.title')}</h2>
                    <div class="time-selector">
                        <button class="time-btn active" data-range="7">${t('progress.timeRanges.week')}</button>
                        <button class="time-btn" data-range="30">${t('progress.timeRanges.month')}</button>
                        <button class="time-btn" data-range="90">3 ${t('progress.timeRanges.month')}</button>
                    </div>
                </div>
                
                <!-- Practice Quality Score -->
                <div class="chart-section">
                    <h3>
                        ${t('progress.qualityScore')}
                        <span class="info-icon" data-info="${t('progress.info.qualityScore')}">?</span>
                    </h3>
                    <div id="quality-gauge"></div>
                </div>
                
                <!-- Accuracy Trend -->
                <div class="chart-section">
                    <h3>
                        ${t('progress.accuracyTrend')}
                        <span class="info-icon" data-info="${t('progress.info.accuracyTrend')}">?</span>
                    </h3>
                    <div id="accuracy-trend"></div>
                </div>
                
                <!-- Practice Distribution -->
                <div class="chart-section">
                    <h3>${t('progress.exerciseDistribution')}</h3>
                    <div id="exercise-distribution"></div>
                </div>
                
                <!-- Performance Heatmap -->
                <div class="chart-section">
                    <h3>
                        ${t('progress.performanceHeatmap')}
                        <span class="info-icon" data-info="${t('progress.info.heatmap')}">?</span>
                    </h3>
                    <div id="performance-heatmap"></div>
                </div>
                
                <!-- Assessment Comparison -->
                <div class="chart-section">
                    <h3>
                        ${t('progress.assessmentComparison')}
                        <span class="info-icon" data-info="${t('progress.info.assessmentComparison')}">?</span>
                    </h3>
                    <div id="assessment-comparison"></div>
                </div>
            </div>
        `;
        
        this.renderCharts();
        this.attachListeners();
    }

    renderCharts(days = 7) {
        this.renderQualityGauge();
        this.renderAccuracyTrend(days);
        this.renderExerciseDistribution(days);
        this.renderPerformanceHeatmap(days);
        this.renderAssessmentComparison();
    }
    
    // Update the quality gauge breakdown labels:
    renderQualityGauge() {
        const quality = assessmentService.calculatePracticeQuality(7);
        if (!quality) return;
        
        const container = d3.select('#quality-gauge');
        container.html(''); // Clear
        
        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2 - 20;
        
        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width/2},${height/2})`);
        
        // Background arc
        const arc = d3.arc()
            .innerRadius(radius - 30)
            .outerRadius(radius)
            .startAngle(0)
            .cornerRadius(10);
        
        svg.append('path')
            .attr('d', arc({ endAngle: Math.PI * 2 }))
            .attr('fill', '#e0e0e0');
        
        // Colored score arc
        const scoreArc = arc({ endAngle: (quality.overall / 100) * Math.PI * 2 });
        const color = quality.overall > 70 ? '#4CAF50' : quality.overall > 40 ? '#FF9800' : '#f44336';
        
        svg.append('path')
            .attr('d', scoreArc)
            .attr('fill', color)
            .transition()
            .duration(1000)
            .attrTween('d', function() {
                const interpolate = d3.interpolate(0, (quality.overall / 100) * Math.PI * 2);
                return function(t) {
                    return arc({ endAngle: interpolate(t) });
                };
            });
        
        // Center text
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.2em')
            .style('font-size', '48px')
            .style('font-weight', 'bold')
            .style('fill', color)
            .text(quality.overall);
        
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.5em')
            .style('font-size', '14px')
            .style('fill', '#666')
            .text('Quality Score');
        
        // Breakdown below gauge
        const breakdown = container.append('div')
            .attr('class', 'quality-breakdown');
        
        Object.entries(quality.breakdown).forEach(([key, value]) => {
            breakdown.append('div')
                .attr('class', 'breakdown-item')
                .html(`
                    <span class="breakdown-label">${t(`progress.quality.${key}`)}:</span>
                    <span class="breakdown-value">${value}%</span>
                `);
        });
    }
    
    
    // Line chart showing accuracy trend
     
    renderAccuracyTrend(days) {
        const data = analyticsService.getProgressTrend(days);
        const validData = data.filter(d => d.accuracy !== null);
        
        if (validData.length === 0) return;
        
        const container = d3.select('#accuracy-trend');
        container.html('');
        
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const width = container.node().offsetWidth - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
        
        const svg = container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Scales
        const x = d3.scaleTime()
            .domain(d3.extent(validData, d => new Date(d.date)))
            .range([0, width]);
        
        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);
        
        // Grid lines
        svg.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(y).tickSize(-width).tickFormat(''))
            .style('stroke', '#e0e0e0')
            .style('stroke-opacity', 0.5);
        
        // Line
        const line = d3.line()
            .x(d => x(new Date(d.date)))
            .y(d => y(d.accuracy))
            .curve(d3.curveMonotoneX);
        
        svg.append('path')
            .datum(validData)
            .attr('fill', 'none')
            .attr('stroke', '#2196F3')
            .attr('stroke-width', 3)
            .attr('d', line);
        
        // Moving average line
        const movingAvgData = validData.filter(d => d.movingAvg !== null);
        const movingAvgLine = d3.line()
            .x(d => x(new Date(d.date)))
            .y(d => y(d.movingAvg))
            .curve(d3.curveMonotoneX);
        
        svg.append('path')
            .datum(movingAvgData)
            .attr('fill', 'none')
            .attr('stroke', '#FF9800')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5')
            .attr('d', movingAvgLine);
        
        // Dots for actual data points
        svg.selectAll('.dot')
            .data(validData)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(new Date(d.date)))
            .attr('cy', d => y(d.accuracy))
            .attr('r', 4)
            .attr('fill', '#2196F3')
            .on('mouseover', function(event, d) {
                d3.select(this).attr('r', 6);
                showTooltip(event, `${d.date}: ${d.accuracy}%`);
            })
            .on('mouseout', function() {
                d3.select(this).attr('r', 4);
                hideTooltip();
            });
        
        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%b %d')));
        
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'));
        
        // Legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - 150}, 0)`);
        
        legend.append('line')
            .attr('x1', 0).attr('x2', 30)
            .attr('stroke', '#2196F3')
            .attr('stroke-width', 3);
        legend.append('text')
            .attr('x', 35).attr('y', 5)
            .text('Daily')
            .style('font-size', '12px');
        
        legend.append('line')
            .attr('x1', 0).attr('x2', 30)
            .attr('y1', 20).attr('y2', 20)
            .attr('stroke', '#FF9800')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');
        legend.append('text')
            .attr('x', 35).attr('y', 25)
            .text('7-day avg')
            .style('font-size', '12px');
    }
    
 
     // Pie/Donut chart showing time distribution

    renderExerciseDistribution(days) {
        const breakdown = analyticsService.getExerciseBreakdown();
        const data = Object.entries(breakdown).map(([type, stats]) => ({
            type,
            value: stats.totalTime
        })).filter(d => d.value > 0);
        
        if (data.length === 0) return;
        
        const container = d3.select('#exercise-distribution');
        container.html('');
        
        const width = 400;
        const height = 400;
        const radius = Math.min(width, height) / 2 - 40;
        
        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width/2},${height/2})`);
        
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.type))
            .range(d3.schemeSet3);
        
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);
        
        const arc = d3.arc()
            .innerRadius(radius * 0.6)
            .outerRadius(radius);
        
        const arcs = svg.selectAll('.arc')
            .data(pie(data))
            .enter().append('g')
            .attr('class', 'arc');
        
        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.type))
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .on('mouseover', function(event, d) {
                d3.select(this).transition()
                    .duration(200)
                    .attr('d', d3.arc()
                        .innerRadius(radius * 0.6)
                        .outerRadius(radius + 10)
                    );
                showTooltip(event, `${d.data.type}: ${formatDuration(d.data.value)}`);
            })
            .on('mouseout', function() {
                d3.select(this).transition()
                    .duration(200)
                    .attr('d', arc);
                hideTooltip();
            });
        
        // Labels
        arcs.append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', 'white')
            .text(d => d.data.type);
    }
    

     // Heatmap showing performance by exercise

    renderPerformanceHeatmap(days) {
        const stats = storageService.get('exerciseTypeStats', {});
        const exercises = Object.keys(stats);
        
        if (exercises.length === 0) return;
        
        // Get daily snapshots for each exercise
        const dateRange = this.getDateRange(days);
        const heatmapData = [];
        
        exercises.forEach(exercise => {
            dateRange.forEach(date => {
                const snapshot = stats[exercise]?.dailySnapshots?.[date];
                const accuracy = snapshot 
                    ? (snapshot.attempts > 0 
                        ? ((snapshot.firstTryCorrect + snapshot.correctWithHints) / snapshot.attempts) * 100
                        : null)
                    : null;
                
                heatmapData.push({ exercise, date, accuracy });
            });
        });
        
        const container = d3.select('#performance-heatmap');
        container.html('');
        
        const margin = { top: 20, right: 20, bottom: 60, left: 100 };
        const cellSize = 40;
        const width = dateRange.length * cellSize + margin.left + margin.right;
        const height = exercises.length * cellSize + margin.top + margin.bottom;
        
        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        const colorScale = d3.scaleSequential()
            .domain([0, 100])
            .interpolator(d3.interpolateRdYlGn);
        
        // Draw cells
        svg.selectAll('.cell')
            .data(heatmapData)
            .enter().append('rect')
            .attr('class', 'cell')
            .attr('x', (d, i) => (i % dateRange.length) * cellSize)
            .attr('y', d => exercises.indexOf(d.exercise) * cellSize)
            .attr('width', cellSize - 2)
            .attr('height', cellSize - 2)
            .attr('fill', d => d.accuracy !== null ? colorScale(d.accuracy) : '#f0f0f0')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .on('mouseover', function(event, d) {
                if (d.accuracy !== null) {
                    showTooltip(event, `${d.exercise} - ${d.date}: ${Math.round(d.accuracy)}%`);
                }
            })
            .on('mouseout', hideTooltip);
        
        // X axis (dates)
        svg.selectAll('.date-label')
            .data(dateRange)
            .enter().append('text')
            .attr('class', 'date-label')
            .attr('x', (d, i) => i * cellSize + cellSize / 2)
            .attr('y', exercises.length * cellSize + 20)
            .attr('text-anchor', 'end')
            .attr('transform', (d, i) => `rotate(-45, ${i * cellSize + cellSize / 2}, ${exercises.length * cellSize + 20})`)
            .style('font-size', '10px')
            .text(d => d.slice(5)); // MM-DD
        
        // Y axis (exercises)
        svg.selectAll('.exercise-label')
            .data(exercises)
            .enter().append('text')
            .attr('class', 'exercise-label')
            .attr('x', -10)
            .attr('y', (d, i) => i * cellSize + cellSize / 2)
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', 'middle')
            .style('font-size', '12px')
            .text(d => d);
    }
    

     // Bar chart comparing assessments
 
    renderAssessmentComparison() {
        const assessments = assessmentService.getAssessmentHistory();
        
        if (assessments.length < 2) {
            d3.select('#assessment-comparison')
                .html('<p class="no-data">Need at least 2 assessments to compare. <button class="btn">Take Assessment</button></p>');
            return;
        }
        
        // Compare first and last
        const comparison = assessmentService.compareAssessments(
            assessments[0],
            assessments[assessments.length - 1]
        );
        
        const data = [
            { metric: 'Accuracy', value: comparison.accuracy.change },
            { metric: 'Response Time', value: -comparison.responseTime.change }, // Inverted
            { metric: 'Hint Usage', value: -comparison.hintsNeeded.change }
        ];
        
        const container = d3.select('#assessment-comparison');
        container.html('');
        
        const margin = { top: 20, right: 20, bottom: 40, left: 120 };
        const width = 600 - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;
        
        const svg = container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        const x = d3.scaleLinear()
            .domain([-100, 100])
            .range([0, width]);
        
        const y = d3.scaleBand()
            .domain(data.map(d => d.metric))
            .range([0, height])
            .padding(0.2);
        
        // Zero line
        svg.append('line')
            .attr('x1', x(0))
            .attr('x2', x(0))
            .attr('y1', 0)
            .attr('y2', height)
            .attr('stroke', '#666')
            .attr('stroke-width', 2);
        
        // Bars
        svg.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => d.value > 0 ? x(0) : x(d.value))
            .attr('y', d => y(d.metric))
            .attr('width', d => Math.abs(x(d.value) - x(0)))
            .attr('height', y.bandwidth())
            .attr('fill', d => d.value > 0 ? '#4CAF50' : '#f44336');
        
        // Value labels
        svg.selectAll('.label')
            .data(data)
            .enter().append('text')
            .attr('x', d => d.value > 0 ? x(d.value) + 5 : x(d.value) - 5)
            .attr('y', d => y(d.metric) + y.bandwidth() / 2)
            .attr('text-anchor', d => d.value > 0 ? 'start' : 'end')
            .attr('alignment-baseline', 'middle')
            .style('font-weight', 'bold')
            .text(d => (d.value > 0 ? '+' : '') + Math.round(d.value) + '%');
        
        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5));
        
        svg.append('g')
            .call(d3.axisLeft(y));
    }
    
    // Helper methods
    getDateRange(days) {
        const dates = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    }
    
    attachListeners() {
        this.container.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.container.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const days = parseInt(e.target.dataset.range);
                this.renderCharts(days);
            });
        });
    }
}

// Tooltip helper functions
let tooltip;

function showTooltip(event, text) {
    if (!tooltip) {
        tooltip = d3.select('body').append('div')
            .attr('class', 'chart-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.8)')
            .style('color', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0);
    }
    
    tooltip.html(text)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .transition()
        .duration(200)
        .style('opacity', 1);
}

function hideTooltip() {
    if (tooltip) {
        tooltip.transition()
            .duration(200)
            .style('opacity', 0);
    }
}

function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

export default ProgressCharts;