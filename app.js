// Application State
class DisabilityEvaluationApp {
    constructor() {
        this.currentPage = 0; // Start at welcome page
        this.totalPages = 8; // Steps 1-8 are now the evaluation, Step 8 is final
        this.formData = this.loadFormData();
        this.jobCount = 1;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgress();
        this.restoreFormData();
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('nextBtn').addEventListener('click', () => this.nextPage());
        document.getElementById('backBtn').addEventListener('click', () => this.previousPage());

        // Add job button
        document.getElementById('addJobBtn').addEventListener('click', () => this.addJobEntry());



        // Currently Working toggle for Date Last Employed
        const currentlyWorkingRadios = document.querySelectorAll('input[name="currentlyWorking"]');
        currentlyWorkingRadios.forEach(radio => {
            radio.addEventListener('change', () => this.toggleLastEmployedField());
        });

        // Auto-save form data on input
        this.setupAutoSave();

        // Apply date masking to date inputs
        this.setupDateMasking();

        // Focus management for accessibility
        this.setupFocusManagement();
    }

    setupDateMasking() {
        const dateInputs = document.querySelectorAll('.date-input');
        dateInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                if (value.length > 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 6);
                }
                e.target.value = value;

                // If this is a job "To" date, try auto-populating "Last Employed"
                if (input.id.includes('jobTo')) {
                    this.autoPopulateLastEmployed();
                }
            });
        });
    }

    autoPopulateLastEmployed() {
        // Find the latest "To" date from all job entries
        const jobToInputs = Array.from(document.querySelectorAll('input[id^="jobTo"]'));
        let latestDate = null;
        let latestValue = '';

        jobToInputs.forEach(input => {
            const value = input.value;
            if (value && value.length === 7) { // mm/yyyy
                const [m, y] = value.split('/').map(Number);
                const d = new Date(y, m - 1, 1);
                if (!latestDate || d > latestDate) {
                    latestDate = d;
                    latestValue = value;
                }
            }
        });

        const lastEmployedField = document.getElementById('lastEmployed');
        const currentlyWorking = document.querySelector('input[name="currentlyWorking"]:checked');

        // Only auto-populate if currently not working and field is empty or contains an old value
        if (lastEmployedField && currentlyWorking && currentlyWorking.value === 'no' && latestValue) {
            lastEmployedField.value = latestValue;
            this.saveFormData();
        }
    }

    setupFocusManagement() {
        // Move focus to main heading when page changes
        const observer = new MutationObserver(() => {
            const activePage = document.querySelector('.page.active');
            if (activePage) {
                const heading = activePage.querySelector('h2');
                if (heading) {
                    heading.setAttribute('tabindex', '-1');
                    heading.focus();
                }
            }
        });

        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            observer.observe(mainContent, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        }
    }

    setupAutoSave() {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', () => this.saveFormData());
            input.addEventListener('input', () => this.saveFormData());
        });
    }

    addJobEntry() {
        this.jobCount++;
        const jobsContainer = document.getElementById('jobsContainer');
        const newJob = document.createElement('div');
        newJob.className = 'job-entry';
        newJob.innerHTML = `
            <div class="form-group">
                <label for="jobTitle${this.jobCount}">Job Title</label>
                <input type="text" id="jobTitle${this.jobCount}" name="jobTitle${this.jobCount}" placeholder="e.g., Retail Sales Associate">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="jobFrom${this.jobCount}">From (mm/yyyy)</label>
                    <input type="text" id="jobFrom${this.jobCount}" name="jobFrom${this.jobCount}" placeholder="e.g., 01/2019" maxlength="7" class="date-input">
                </div>
                <div class="form-group">
                    <label for="jobTo${this.jobCount}">To (mm/yyyy)</label>
                    <input type="text" id="jobTo${this.jobCount}" name="jobTo${this.jobCount}" placeholder="e.g., 12/2022" maxlength="7" class="date-input">
                </div>
            </div>
        `;
        jobsContainer.appendChild(newJob);
        this.setupAutoSave();
        this.setupDateMasking(); // Apply masking to new inputs
    }


    toggleLastEmployedField() {
        const currentlyWorking = document.querySelector('input[name="currentlyWorking"]:checked');
        const lastEmployedField = document.getElementById('lastEmployed');

        if (currentlyWorking && lastEmployedField) {
            if (currentlyWorking.value === 'yes') {
                lastEmployedField.disabled = true;
                lastEmployedField.value = '';
            } else {
                lastEmployedField.disabled = false;
                this.autoPopulateLastEmployed(); // Try to auto-populate when switching to "No"
            }
        }
    }


    saveFormData() {
        const formData = {};
        const inputs = document.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                if (input.checked) {
                    if (input.type === 'checkbox') {
                        if (!formData[input.name]) {
                            formData[input.name] = [];
                        }
                        formData[input.name].push(input.value);
                    } else {
                        formData[input.name] = input.value;
                    }
                }
            } else {
                formData[input.id || input.name] = input.value;
            }
        });

        sessionStorage.setItem('disabilityEvaluation', JSON.stringify(formData));
        this.formData = formData;
    }

    loadFormData() {
        const saved = sessionStorage.getItem('disabilityEvaluation');
        return saved ? JSON.parse(saved) : {};
    }

    restoreFormData() {
        Object.keys(this.formData).forEach(key => {
            const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);

            if (element) {
                if (element.type === 'radio') {
                    const radio = document.querySelector(`input[name="${key}"][value="${this.formData[key]}"]`);
                    if (radio) radio.checked = true;
                } else if (element.type === 'checkbox') {
                    if (Array.isArray(this.formData[key])) {
                        this.formData[key].forEach(value => {
                            const checkbox = document.querySelector(`input[name="${key}"][value="${value}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    }
                } else {
                    element.value = this.formData[key];
                }
            }
        });
    }

    validatePage(pageNum) {
        // Clear previous errors
        document.querySelectorAll('.form-group.error').forEach(group => {
            group.classList.remove('error');
            const errorMsg = group.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });

        let isValid = true;

        // Page 0: Consent validation
        if (pageNum === 0) {
            const consentCheckbox = document.getElementById('consentCheckbox');
            if (!consentCheckbox || !consentCheckbox.checked) {
                this.showError(consentCheckbox, 'Please acknowledge that you understand this is a preliminary screening tool by checking the consent box.');
                isValid = false;
            }
        }

        // Page 8: Age validation (required)
        if (pageNum === 8) {
            const ageInput = document.getElementById('currentAge');
            if (!ageInput || !ageInput.value || ageInput.value < 0 || ageInput.value > 120) {
                this.showError(ageInput, 'Please enter a valid age (0-120)');
                isValid = false;
            }
        }

        return isValid;
    }

    showError(inputElement, message) {
        if (!inputElement) return;

        const formGroup = inputElement.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');

            // Create or update error message
            let errorMsg = formGroup.querySelector('.error-message');
            if (!errorMsg) {
                errorMsg = document.createElement('span');
                errorMsg.className = 'error-message';
                errorMsg.setAttribute('role', 'alert');
                inputElement.parentNode.appendChild(errorMsg);
            }
            errorMsg.textContent = message;
        }

        inputElement.focus();
    }

    nextPage() {
        // Validate current page before proceeding
        if (!this.validatePage(this.currentPage)) {
            return;
        }

        if (this.currentPage < this.totalPages) {
            this.saveFormData();
            this.currentPage++;
            this.showPage(this.currentPage);
        } else if (this.currentPage === this.totalPages) {
            // Generate results (Step 8 is now the final step)
            this.saveFormData();
            this.generateResults();
        }
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.showPage(this.currentPage);
        }
    }

    showPage(pageNum) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show current page
        const currentPageElement = document.getElementById(`page${pageNum}`);
        if (currentPageElement) {
            currentPageElement.classList.add('active');
        }

        // Update navigation buttons
        const backBtn = document.getElementById('backBtn');
        const nextBtn = document.getElementById('nextBtn');

        backBtn.disabled = pageNum === 0;

        if (pageNum === this.totalPages) {
            nextBtn.textContent = 'Generate Results →';
        } else {
            nextBtn.textContent = 'Next →';
        }

        this.updateProgress();
    }

    updateProgress() {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const percentage = (this.currentPage / this.totalPages) * 100;

        progressBar.style.setProperty('--progress-width', `${percentage}%`);

        if (this.currentPage === 0) {
            progressText.textContent = 'Welcome';
        } else {
            progressText.textContent = `Step ${this.currentPage} of ${this.totalPages}`;
        }
    }

    generateResults() {
        const evaluation = this.evaluateEligibility();

        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show results page
        const resultsPage = document.getElementById('resultsPage');
        resultsPage.classList.add('active');

        // Update results content
        const determinationDiv = document.getElementById('resultDetermination');
        const explanationDiv = document.getElementById('resultExplanation');

        determinationDiv.className = `result-determination ${evaluation.determination === 'allowance' ? 'likely-allowance' : 'likely-denial'}`;
        determinationDiv.innerHTML = `<h2>${evaluation.determination === 'allowance' ? '✓ Likely Allowance' : '⚠ Likely Denial'}</h2>`;

        explanationDiv.innerHTML = `
            <h3>Evaluation Summary</h3>
            <p>${evaluation.summary}</p>
            <h3>Key Factors</h3>
            <ul>
                ${evaluation.factors.map(factor => `<li>${factor}</li>`).join('')}
            </ul>
            ${evaluation.recommendations ? `
                <h3>Recommendations</h3>
                <ul>
                    ${evaluation.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            ` : ''}
        `;

        // Hide navigation buttons
        document.querySelector('footer').style.display = 'none';

        // Update progress
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        progressBar.style.setProperty('--progress-width', '100%');
        progressText.textContent = 'Evaluation Complete';

        // Attach event listeners to results page buttons (they exist now)
        const printBtn = document.getElementById('printResults');
        const startOverBtn = document.getElementById('startOver');

        if (printBtn) {
            printBtn.addEventListener('click', () => window.print());
        }

        if (startOverBtn) {
            startOverBtn.addEventListener('click', () => this.resetEvaluation());
        }
    }

    evaluateEligibility() {
        const age = parseInt(this.formData.currentAge) || 0;
        const physicalConditions = this.formData.physicalConditions || '';
        const psychConditions = this.formData.psychologicalConditions || '';
        const lifting = this.formData.lifting || '';
        const standing = this.formData.standing || '';
        const sitting = this.formData.sitting || '';
        const walking = this.formData.walking || '';
        const iqScore = parseInt(this.formData.iqScore) || 0;
        const education = this.formData.lastGrade || '';
        const lastEmployed = this.formData.lastEmployed || '';

        // Helper function to parse mm/yyyy to Date
        const parseDate = (str) => {
            if (!str || str.length !== 7) return null;
            const [m, y] = str.split('/').map(Number);
            return new Date(y, m - 1, 1);
        };

        // Get assistive devices
        const devices = [];
        document.querySelectorAll('input[name="device"]:checked').forEach(cb => {
            devices.push(cb.value);
        });

        // Get ADL limitations
        const shopping = this.formData.shopping || '';
        const cooking = this.formData.cooking || '';
        const cleaning = this.formData.cleaning || '';
        const hygiene = this.formData.hygiene || '';

        let score = 0;
        const factors = [];
        const recommendations = [];

        // Age evaluation (Grid Rules)
        if (age >= 55) {
            score += 3;
            factors.push(`Age ${age} - Closely approaching advanced age, favorable under Grid Rules`);
        } else if (age >= 50) {
            score += 2;
            factors.push(`Age ${age} - Approaching advanced age, considered in Grid Rules`);
        } else if (age < 18) {
            factors.push(`Age ${age} - Childhood disability criteria apply`);
        } else {
            factors.push(`Age ${age} - Younger individual, higher functional capacity expected`);
        }

        // Medical conditions evaluation
        const severeConditions = [
            'cancer', 'als', 'alzheimer', 'parkinson', 'multiple sclerosis', 'ms',
            'heart failure', 'kidney failure', 'liver failure', 'copd', 'emphysema',
            'stroke', 'paralysis', 'amputation', 'blindness', 'deaf'
        ];

        const allConditions = (physicalConditions + ' ' + psychConditions).toLowerCase();
        let hasSevereCondition = false;

        severeConditions.forEach(condition => {
            if (allConditions.includes(condition)) {
                score += 4;
                hasSevereCondition = true;
                factors.push(`Severe medical condition identified: May qualify under Compassionate Allowances or Blue Book listing`);
            }
        });

        // Mental health severe conditions
        const severeMentalConditions = ['schizophrenia', 'bipolar', 'psychosis', 'severe depression'];
        severeMentalConditions.forEach(condition => {
            if (allConditions.includes(condition)) {
                score += 3;
                factors.push(`Severe mental health condition: ${condition} - May meet Blue Book 12.00 criteria`);
            }
        });

        // IQ Score evaluation
        if (iqScore > 0 && iqScore < 70) {
            score += 4;
            factors.push(`IQ Score ${iqScore} - Intellectual disability, likely meets Blue Book 12.05 criteria`);
        } else if (iqScore >= 70 && iqScore < 80) {
            score += 2;
            factors.push(`IQ Score ${iqScore} - Borderline intellectual functioning, considered with other limitations`);
        }

        // Physical RFC evaluation
        let rfcLevel = 'heavy';
        if (lifting === 'none' || lifting === 'sedentary') {
            score += 3;
            rfcLevel = 'sedentary';
            factors.push('Residual Functional Capacity: Sedentary work level - Significantly limited');
        } else if (lifting === 'light') {
            score += 2;
            rfcLevel = 'light';
            factors.push('Residual Functional Capacity: Light work level - Moderately limited');
        } else if (lifting === 'medium') {
            score += 1;
            rfcLevel = 'medium';
            factors.push('Residual Functional Capacity: Medium work level - Some limitations');
        }

        // Standing/sitting/walking limitations
        if (standing === 'none' || standing === 'less15' ||
            sitting === 'none' || sitting === 'less15' ||
            walking === 'none' || walking === 'less15') {
            score += 2;
            factors.push('Severe postural limitations: Cannot stand, sit, or walk for extended periods');
        }

        // Assistive devices
        if (devices.includes('wheelchair')) {
            score += 3;
            factors.push('Requires wheelchair for mobility - Meets Grid Rule criteria for inability to ambulate effectively');
        } else if (devices.includes('walker') || devices.includes('crutches')) {
            score += 2;
            factors.push('Requires assistive device for ambulation - Significant mobility limitation');
        } else if (devices.includes('cane')) {
            score += 1;
            factors.push('Requires cane for mobility - Moderate limitation');
        }

        // ADL limitations
        let adlLimitations = 0;
        if (hygiene === 'unable' || hygiene === 'assistance') adlLimitations++;
        if (shopping === 'unable') adlLimitations++;
        if (cooking === 'unable') adlLimitations++;
        if (cleaning === 'unable') adlLimitations++;

        if (adlLimitations >= 3) {
            score += 3;
            factors.push(`Severe limitations in Activities of Daily Living (${adlLimitations} activities affected) - Indicates marked functional limitation`);
        } else if (adlLimitations >= 2) {
            score += 2;
            factors.push(`Moderate limitations in Activities of Daily Living (${adlLimitations} activities affected)`);
        }

        // Education level (Grid Rules)
        if (education === '0-8' || education === '9' || education === '10') {
            score += 1;
            factors.push('Limited education - Favorable factor under Grid Rules for older individuals');
        } else if (education === 'bachelor' || education === 'graduate') {
            factors.push('Higher education - May indicate ability to perform sedentary skilled work');
        }

        // Work history
        if (lastEmployed) {
            const lastWorkDate = parseDate(lastEmployed);
            if (lastWorkDate) {
                const today = new Date();
                const monthsSinceWork = (today - lastWorkDate) / (1000 * 60 * 60 * 24 * 30);

                if (monthsSinceWork > 60) {
                    score += 1;
                    factors.push('No work activity for over 5 years - Skills may be outdated');
                }
            }
        }

        // Determine result
        let determination = 'denial';
        let summary = '';

        if (score >= 10 || hasSevereCondition) {
            determination = 'allowance';
            summary = 'Based on the information provided, this case shows strong indicators for disability allowance. The combination of medical conditions, functional limitations, and other factors suggests you likely meet SSA disability criteria.';

            recommendations.push('Gather all medical records documenting your conditions and limitations');
            recommendations.push('Obtain detailed statements from treating physicians about your functional capacity');
            recommendations.push('File your application as soon as possible if you haven\'t already');
        } else if (score >= 6) {
            determination = 'allowance';
            summary = 'Based on the information provided, this case shows moderate to strong indicators for disability allowance. However, the outcome will heavily depend on the medical evidence and documentation you can provide.';

            recommendations.push('Ensure you have comprehensive medical documentation of all conditions');
            recommendations.push('Request detailed RFC assessments from your doctors');
            recommendations.push('Document all limitations in daily activities');
        } else {
            determination = 'denial';
            summary = 'Based on the information provided, this preliminary screening suggests your case may face challenges in meeting SSA disability criteria. However, this does not mean you should not apply - each case is unique and evaluated on complete medical evidence.';

            recommendations.push('Consult with your doctors about the full extent of your limitations');
            recommendations.push('Ensure all medical conditions are properly documented and treated');
            recommendations.push('Consider whether your conditions have worsened since last evaluation');
            recommendations.push('If denied, you have the right to appeal with additional evidence');
        }

        return {
            determination,
            summary,
            factors,
            recommendations
        };
    }

    resetEvaluation() {
        if (confirm('Are you sure you want to start a new evaluation? This will clear all current data.')) {
            // Clear session storage
            sessionStorage.removeItem('disabilityEvaluation');
            this.formData = {};

            // Reset all form inputs
            document.querySelectorAll('input, select, textarea').forEach(input => {
                if (input.type === 'radio' || input.type === 'checkbox') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });

            // Reset to first page (welcome page)
            this.currentPage = 0;
            this.showPage(0);

            // Show footer navigation again
            document.querySelector('footer').style.display = 'block';

            // Reset progress
            this.updateProgress();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DisabilityEvaluationApp();
});
