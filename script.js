const STORAGE_KEYS = {
    study: "careerCuratorStudy",
    jobs: "careerCuratorJobs",
    legacyJobs: "jobs"
};

const STATUS_OPTIONS = ["Applied", "Interview", "Rejected", "Offer"];

let studybutton = document.getElementById("studybutton");
let studyhourstext = document.getElementById("studyhourstext");
let studyhourstextpage = document.getElementById("studyhourstextpage");
let progressfill = document.getElementById("progressfill");
let summaryprogressfill = document.getElementById("summaryprogressfill");
let resetbutton = document.getElementById("resetbutton");
let goalstatus = document.getElementById("goalstatus");
let goalstatuspage = document.getElementById("goalstatuspage");
let goalinput = document.getElementById("goalinput");
let goaldisplay = document.getElementById("goaldisplay");
let goalpagevalue = document.getElementById("goalpagevalue");
let setgoalbutton = document.getElementById("setgoalbutton");
let addjobbutton = document.getElementById("addjobbutton");
let companyinput = document.getElementById("companyinput");
let roleinput = document.getElementById("roleinput");
let locationinput = document.getElementById("locationinput");
let salaryinput = document.getElementById("salaryinput");
let urlinput = document.getElementById("urlinput");
let dateinput = document.getElementById("dateinput");
let statusinput = document.getElementById("statusinput");
let followupinput = document.getElementById("followupinput");
let notesinput = document.getElementById("notesinput");
let jobsearch = document.getElementById("jobsearch");
let jobstatusfilter = document.getElementById("jobstatusfilter");
let jobsort = document.getElementById("jobsort");
let csvfileinput = document.getElementById("csvfileinput");
let exportjobsbutton = document.getElementById("exportjobsbutton");
let importjobsbutton = document.getElementById("importjobsbutton");
let joblist = document.getElementById("joblist");
let jobcount = document.getElementById("jobcount");
let statTotal = document.getElementById("statTotal");
let statInterviews = document.getElementById("statInterviews");
let statOffers = document.getElementById("statOffers");
let statRejected = document.getElementById("statRejected");
let jobsSummaryTotal = document.getElementById("jobsSummaryTotal");
let jobsSummaryInterviews = document.getElementById("jobsSummaryInterviews");
let jobsSummaryOffers = document.getElementById("jobsSummaryOffers");
let jobsSummaryRejected = document.getElementById("jobsSummaryRejected");
let upcomingFollowups = document.getElementById("upcomingFollowups");
let recentActivity = document.getElementById("recentActivity");
let navLinks = document.querySelectorAll(".nav-link");
let pageSections = document.querySelectorAll(".page-section");
let summaryButtons = document.querySelectorAll(".summary-card-button");

let dailygoal = 3;
let studyhours = 0;
let jobs = [];
let editingIndex = null;

function isValidNumber(value) {
    return Number.isFinite(Number(value));
}

function safeNumber(value, fallback) {
    let result = Number(value);
    return Number.isFinite(result) ? result : fallback;
}

function saveStudyData() {
    const studyData = {
        studyHours: studyhours,
        dailyGoal: dailygoal
    };

    localStorage.setItem(STORAGE_KEYS.study, JSON.stringify(studyData));
    localStorage.setItem("studyhours", String(studyhours));
    localStorage.setItem("dailygoal", String(dailygoal));
}

function loadStudyData() {
    try {
        const storedStudy = localStorage.getItem(STORAGE_KEYS.study);
        if (storedStudy) {
            const parsedStudy = JSON.parse(storedStudy);
            if (parsedStudy && typeof parsedStudy === "object") {
                dailygoal = safeNumber(parsedStudy.dailyGoal, 3);
                studyhours = safeNumber(parsedStudy.studyHours, 0);
            }
        }
    } catch (error) {
        console.warn("Could not load saved study data.", error);
    }

    if (!isValidNumber(dailygoal) || dailygoal < 1) {
        dailygoal = 3;
    }

    if (!isValidNumber(studyhours) || studyhours < 0) {
        studyhours = 0;
    }
}

function normalizeJob(job, index) {
    const safeCompany = String(job && job.company ? job.company : "").trim();
    const safeRole = String(job && job.role ? job.role : "").trim();
    const safeDate = job && job.date ? job.date : "";
    const safeStatus = STATUS_OPTIONS.includes(job && job.status) ? job.status : "Applied";
    const safeLocation = job && job.location ? String(job.location) : "";
    const safeSalary = job && job.salary ? String(job.salary) : "";
    const safeUrl = job && job.url ? String(job.url) : "";
    const safeFollowUpDate = job && job.followUpDate ? job.followUpDate : "";
    const safeNotes = job && job.notes ? String(job.notes) : "";
    const safeCompleted = Boolean(job && job.followUpCompleted);

    return {
        company: safeCompany,
        role: safeRole,
        date: safeDate,
        status: safeStatus,
        location: safeLocation,
        salary: safeSalary,
        url: safeUrl,
        followUpDate: safeFollowUpDate,
        notes: safeNotes,
        followUpCompleted: safeCompleted,
        id: job && job.id ? job.id : "job-" + index + "-" + Date.now()
    };
}

function loadJobs() {
    try {
        const storedJobs = localStorage.getItem(STORAGE_KEYS.jobs);
        if (storedJobs) {
            const parsedJobs = JSON.parse(storedJobs);
            if (Array.isArray(parsedJobs)) {
                jobs = parsedJobs.map(normalizeJob);
                return;
            }
        }
    } catch (error) {
        console.warn("Could not load saved jobs from new key.", error);
    }

    try {
        const legacyJobs = localStorage.getItem(STORAGE_KEYS.legacyJobs);
        if (legacyJobs) {
            const parsedLegacyJobs = JSON.parse(legacyJobs);
            if (Array.isArray(parsedLegacyJobs)) {
                jobs = parsedLegacyJobs.map(normalizeJob);
                saveJobs();
                return;
            }
        }
    } catch (error) {
        console.warn("Could not load legacy jobs data.", error);
    }

    jobs = [];
}

function saveJobs() {
    localStorage.setItem(STORAGE_KEYS.jobs, JSON.stringify(jobs));
    localStorage.setItem(STORAGE_KEYS.legacyJobs, JSON.stringify(jobs));
}

function updateStudyText() {
    studyhourstext.textContent = studyhours + (studyhours === 1 ? " hour this week." : " hours this week.");
    studyhourstextpage.textContent = studyhours + (studyhours === 1 ? " hour this week." : " hours this week.");
}

function getJobStats() {
    const stats = {
        total: jobs.length,
        interviews: 0,
        offers: 0,
        rejected: 0,
        applied: 0
    };

    jobs.forEach(function(job) {
        if (job.status === "Interview") {
            stats.interviews += 1;
        } else if (job.status === "Offer") {
            stats.offers += 1;
        } else if (job.status === "Rejected") {
            stats.rejected += 1;
        } else if (job.status === "Applied") {
            stats.applied += 1;
        }
    });

    return stats;
}

function updateDashboardSummary() {
    const stats = getJobStats();

    jobcount.textContent = stats.total === 1 ? "1 application so far." : stats.total + " applications so far.";
    statTotal.textContent = stats.total;
    statInterviews.textContent = stats.interviews;
    statOffers.textContent = stats.offers;
    statRejected.textContent = stats.rejected;

    jobsSummaryTotal.textContent = stats.total;
    jobsSummaryInterviews.textContent = stats.interviews;
    jobsSummaryOffers.textContent = stats.offers;
    jobsSummaryRejected.textContent = stats.rejected;

    const upcoming = jobs
        .filter(function(job) {
            return job.followUpDate && !job.followUpCompleted;
        })
        .sort(function(a, b) {
            return new Date(a.followUpDate) - new Date(b.followUpDate);
        })
        .slice(0, 3);

    upcomingFollowups.innerHTML = "";
    if (upcoming.length === 0) {
        upcomingFollowups.innerHTML = '<p class="empty-state">No upcoming follow-ups.</p>';
    } else {
        upcoming.forEach(function(job) {
            const item = document.createElement("div");
            item.className = "mini-list-item";
            item.textContent = job.company + " — " + job.followUpDate;
            upcomingFollowups.appendChild(item);
        });
    }

    const recent = [...jobs]
        .sort(function(a, b) {
            return new Date(b.date || 0) - new Date(a.date || 0);
        })
        .slice(0, 3);

    recentActivity.innerHTML = "";
    if (recent.length === 0) {
        recentActivity.innerHTML = '<p class="empty-state">No recent activity yet.</p>';
    } else {
        recent.forEach(function(job) {
            const item = document.createElement("div");
            item.className = "mini-list-item";
            item.textContent = job.company + " — " + job.status;
            recentActivity.appendChild(item);
        });
    }
}

function updateStudyProgress() {
    if (!isValidNumber(dailygoal) || dailygoal < 1) {
        dailygoal = 3;
    }

    let progress = (studyhours / dailygoal) * 100;
    if (progress > 100) progress = 100;
    if (!Number.isFinite(progress)) progress = 0;

    progressfill.style.width = progress + "%";
    summaryprogressfill.style.width = progress + "%";

    goaldisplay.textContent = dailygoal;
    goalpagevalue.textContent = dailygoal;

    if (progress >= 100) {
        progressfill.style.backgroundColor = "green";
        summaryprogressfill.style.backgroundColor = "green";
        goalstatus.textContent = "Daily goal complete!🎉👍";
        goalstatuspage.textContent = "Daily goal complete!🎉👍";
    } else if (progress >= 50) {
        progressfill.style.backgroundColor = "orange";
        summaryprogressfill.style.backgroundColor = "orange";
        goalstatus.textContent = "Keep going!";
        goalstatuspage.textContent = "Keep going!";
    } else {
        progressfill.style.backgroundColor = "red";
        summaryprogressfill.style.backgroundColor = "red";
        goalstatus.textContent = "Keep going!";
        goalstatuspage.textContent = "Keep going!";
    }
}

function getDateValue(dateText) {
    if (!dateText) return null;
    return new Date(dateText + "T00:00:00");
}

function getFilterMatches(job) {
    const searchText = jobsearch.value.trim().toLowerCase();
    const selectedStatus = jobstatusfilter.value;

    const matchesSearch = !searchText ||
        (job.company + " " + job.role).toLowerCase().includes(searchText);

    const matchesStatus = selectedStatus === "All" || job.status === selectedStatus;

    return matchesSearch && matchesStatus;
}

function getSortedJobs(items) {
    const sortValue = jobsort.value;
    const sorted = [...items];

    if (sortValue === "date-asc") {
        sorted.sort(function(a, b) {
            return new Date(a.date || 0) - new Date(b.date || 0);
        });
    } else if (sortValue === "followup-asc") {
        sorted.sort(function(a, b) {
            if (!a.followUpDate && !b.followUpDate) return 0;
            if (!a.followUpDate) return 1;
            if (!b.followUpDate) return -1;
            return new Date(a.followUpDate) - new Date(b.followUpDate);
        });
    } else {
        sorted.sort(function(a, b) {
            return new Date(b.date || 0) - new Date(a.date || 0);
        });
    }

    return sorted;
}

function renderJobs() {
    joblist.innerHTML = "";

    const filteredJobs = getSortedJobs(jobs.filter(getFilterMatches));

    if (filteredJobs.length === 0) {
        const emptyState = document.createElement("p");
        emptyState.className = "empty-state";
        emptyState.textContent = "No jobs match your search or filter.";
        joblist.appendChild(emptyState);
        return;
    }

    filteredJobs.forEach(function(job, visibleIndex) {
        const originalIndex = jobs.indexOf(job);
        const jobItem = document.createElement("div");
        jobItem.className = "job-item";

        if (editingIndex === originalIndex) {
            const editForm = document.createElement("div");
            editForm.className = "job-edit-form";

            const companyField = document.createElement("input");
            companyField.type = "text";
            companyField.value = job.company;
            companyField.className = "job-edit-input";

            const roleField = document.createElement("input");
            roleField.type = "text";
            roleField.value = job.role;
            roleField.className = "job-edit-input";

            const locationField = document.createElement("input");
            locationField.type = "text";
            locationField.value = job.location || "";
            locationField.className = "job-edit-input";

            const salaryField = document.createElement("input");
            salaryField.type = "text";
            salaryField.value = job.salary || "";
            salaryField.className = "job-edit-input";

            const urlField = document.createElement("input");
            urlField.type = "url";
            urlField.value = job.url || "";
            urlField.className = "job-edit-input";

            const dateField = document.createElement("input");
            dateField.type = "date";
            dateField.value = job.date;
            dateField.className = "job-edit-input";

            const statusField = document.createElement("select");
            statusField.className = "job-edit-select";
            STATUS_OPTIONS.forEach(function(optionText) {
                const option = document.createElement("option");
                option.value = optionText;
                option.textContent = optionText;
                if (job.status === optionText) option.selected = true;
                statusField.appendChild(option);
            });

            const followUpField = document.createElement("input");
            followUpField.type = "date";
            followUpField.value = job.followUpDate || "";
            followUpField.className = "job-edit-input";

            const notesField = document.createElement("textarea");
            notesField.placeholder = "Optional notes";
            notesField.value = job.notes || "";
            notesField.className = "job-edit-notes";

            const formActions = document.createElement("div");
            formActions.className = "job-actions";

            const saveButton = document.createElement("button");
            saveButton.textContent = "Save Changes";
            saveButton.className = "save-job-btn";
            saveButton.type = "button";
            saveButton.addEventListener("click", function() {
                const updatedCompany = companyField.value.trim();
                const updatedRole = roleField.value.trim();
                const updatedDate = dateField.value;
                const updatedStatus = statusField.value;
                const updatedFollowUp = followUpField.value;
                const updatedNotes = notesField.value.trim();

                if (!updatedCompany || !updatedRole || !updatedDate) {
                    alert("Please fill in Company Name, Job Role, and Application Date.");
                    return;
                }

                if (updatedFollowUp && !updatedFollowUp.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    alert("Please enter a valid follow-up date.");
                    return;
                }

                jobs[originalIndex] = {
                    ...jobs[originalIndex],
                    company: updatedCompany,
                    role: updatedRole,
                    location: locationField.value.trim(),
                    salary: salaryField.value.trim(),
                    url: urlField.value.trim(),
                    date: updatedDate,
                    status: updatedStatus,
                    followUpDate: updatedFollowUp,
                    notes: updatedNotes,
                    followUpCompleted: false
                };

                editingIndex = null;
                saveJobs();
                renderJobs();
                updateDashboardSummary();
            });

            const cancelButton = document.createElement("button");
            cancelButton.textContent = "Cancel";
            cancelButton.className = "cancel-job-btn";
            cancelButton.type = "button";
            cancelButton.addEventListener("click", function() {
                editingIndex = null;
                renderJobs();
            });

            formActions.appendChild(saveButton);
            formActions.appendChild(cancelButton);

            const fields = [
                { label: "Company Name", element: companyField },
                { label: "Job Role", element: roleField },
                { label: "Location", element: locationField },
                { label: "Salary / CTC", element: salaryField },
                { label: "Job Posting URL", element: urlField },
                { label: "Application Date", element: dateField },
                { label: "Status", element: statusField },
                { label: "Follow-up Date", element: followUpField },
                { label: "Notes", element: notesField }
            ];

            fields.forEach(function(field) {
                const label = document.createElement("label");
                label.textContent = field.label;
                label.className = "job-edit-label";
                editForm.appendChild(label);
                editForm.appendChild(field.element);
            });

            editForm.appendChild(formActions);
            jobItem.appendChild(editForm);
            joblist.appendChild(jobItem);
            return;
        }

        const jobHeader = document.createElement("div");
        jobHeader.className = "job-item-header";

        const jobTitle = document.createElement("h4");
        jobTitle.textContent = (job.company || "Unknown company") + " — " + (job.role || "Untitled role");

        const statusBadge = document.createElement("span");
        statusBadge.className = "job-status status-" + (job.status || "applied").toLowerCase();
        statusBadge.textContent = job.status || "Applied";

        const jobDate = document.createElement("p");
        jobDate.textContent = "Application date: " + (job.date || "Not set");

        const jobMeta = document.createElement("p");
        const metaParts = [];
        if (job.location) metaParts.push(job.location);
        if (job.salary) metaParts.push(job.salary);
        jobMeta.textContent = metaParts.length ? "Details: " + metaParts.join(" • ") : "Details: No location or salary added";

        const urlText = document.createElement("p");
        if (job.url) {
            const link = document.createElement("a");
            link.href = job.url;
            link.target = "_blank";
            link.rel = "noreferrer";
            link.textContent = "Open posting";
            urlText.appendChild(link);
        } else {
            urlText.textContent = "Posting URL: Not added";
        }

        const followUpDate = document.createElement("p");
        if (job.followUpDate) {
            const followDate = getDateValue(job.followUpDate);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);

            if (job.followUpCompleted) {
                followUpDate.textContent = "Follow-up: Completed";
                followUpDate.className = "followup done";
            } else if (followDate && followDate < todayDate) {
                followUpDate.textContent = "Follow-up: Overdue (" + job.followUpDate + ")";
                followUpDate.className = "followup overdue";
            } else if (followDate && followDate.getTime() === todayDate.getTime()) {
                followUpDate.textContent = "Follow-up: Due today (" + job.followUpDate + ")";
                followUpDate.className = "followup today";
            } else if (followDate) {
                followUpDate.textContent = "Follow-up: Upcoming (" + job.followUpDate + ")";
                followUpDate.className = "followup upcoming";
            } else {
                followUpDate.textContent = "Follow-up: Not set";
                followUpDate.className = "followup none";
            }
        } else {
            followUpDate.textContent = "Follow-up: Not set";
            followUpDate.className = "followup none";
        }

        const notes = document.createElement("p");
        if (job.notes && job.notes.trim()) {
            notes.textContent = "Notes: " + job.notes;
            notes.className = "job-notes";
        }

        const actionRow = document.createElement("div");
        actionRow.className = "job-actions";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-job-btn";
        editButton.type = "button";
        editButton.addEventListener("click", function() {
            editingIndex = originalIndex;
            renderJobs();
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-job-btn";
        deleteButton.type = "button";
        deleteButton.addEventListener("click", function() {
            const shouldDelete = window.confirm("Delete this job application?");
            if (!shouldDelete) return;

            jobs.splice(originalIndex, 1);
            if (editingIndex === originalIndex) editingIndex = null;
            saveJobs();
            renderJobs();
            updateDashboardSummary();
        });

        const followUpButton = document.createElement("button");
        followUpButton.type = "button";
        followUpButton.className = "followup-toggle-btn";

        if (!job.followUpDate) {
            followUpButton.disabled = true;
            followUpButton.textContent = "No follow-up date";
        } else if (job.followUpCompleted) {
            followUpButton.textContent = "Mark as active";
        } else {
            followUpButton.textContent = "Mark complete";
        }

        followUpButton.addEventListener("click", function() {
            if (!job.followUpDate) {
                alert("Add a follow-up date before marking this job complete.");
                return;
            }

            jobs[originalIndex].followUpCompleted = !jobs[originalIndex].followUpCompleted;
            saveJobs();
            renderJobs();
            updateDashboardSummary();
        });

        actionRow.appendChild(editButton);
        actionRow.appendChild(deleteButton);
        actionRow.appendChild(followUpButton);

        jobHeader.appendChild(jobTitle);
        jobHeader.appendChild(statusBadge);

        jobItem.appendChild(jobHeader);
        jobItem.appendChild(jobDate);
        jobItem.appendChild(jobMeta);
        jobItem.appendChild(urlText);
        jobItem.appendChild(followUpDate);
        if (notes.textContent) {
            jobItem.appendChild(notes);
        }
        jobItem.appendChild(actionRow);

        joblist.appendChild(jobItem);
    });
}

function showSection(sectionId) {
    pageSections.forEach(function(section) {
        section.classList.toggle("active", section.id === sectionId);
    });

    navLinks.forEach(function(link) {
        link.classList.toggle("active", link.getAttribute("href") === "#" + sectionId);
    });
}

function resetStudyHours() {
    const shouldReset = window.confirm("Reset today's study hours?");
    if (!shouldReset) return;

    studyhours = 0;
    updateStudyText();
    updateStudyProgress();
    saveStudyData();
}

function exportJobsToCsv() {
    if (jobs.length === 0) {
        alert("There are no jobs to export yet.");
        return;
    }

    const headers = ["company", "role", "location", "salary", "url", "date", "status", "followUpDate", "notes", "followUpCompleted"];
    const rows = jobs.map(function(job) {
        return headers.map(function(header) {
            const value = String(job[header] || "").replace(/"/g, '""');
            return '"' + value + '"';
        }).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "career-curator-jobs.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function importJobsFromCsv(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const text = event.target.result;
            const lines = text.split(/\r?\n/).filter(function(line) { return line.trim(); });
            if (lines.length < 2) {
                alert("This CSV file is empty or missing rows.");
                return;
            }

            const headers = lines[0].split(",").map(function(value) {
                return value.replace(/^"|"$/g, "").trim();
            });

            const parsedRows = lines.slice(1).map(function(line) {
                const cells = line.match(/(?:"[^"]*(?:""[^"]*)*"|[^,]+)/g) || [];
                const values = cells.map(function(value) {
                    return value.replace(/^"|"$/g, "").replace(/""/g, '"');
                });

                const row = {};
                headers.forEach(function(header, index) {
                    row[header] = values[index] || "";
                });
                return row;
            });

            const importedJobs = parsedRows
                .filter(function(row) {
                    return row.company || row.role || row.date;
                })
                .map(function(row) {
                    return normalizeJob({
                        company: row.company || "",
                        role: row.role || "",
                        location: row.location || "",
                        salary: row.salary || "",
                        url: row.url || "",
                        date: row.date || "",
                        status: STATUS_OPTIONS.includes(row.status) ? row.status : "Applied",
                        followUpDate: row.followUpDate || "",
                        notes: row.notes || "",
                        followUpCompleted: row.followUpCompleted === "true",
                        id: "imported-" + Date.now() + Math.random()
                    }, 0);
                })
                .filter(function(job) {
                    return job.company && job.role && job.date;
                });

            if (importedJobs.length === 0) {
                alert("No valid job rows were found in the CSV file.");
                return;
            }

            const existingCount = jobs.length;
            jobs = jobs.concat(importedJobs);
            saveJobs();
            renderJobs();
            updateDashboardSummary();

            alert(importedJobs.length + " job(s) imported. Added to existing records (previous total: " + existingCount + ").");
        } catch (error) {
            console.error(error);
            alert("The CSV file could not be read. Please check the file format.");
        }
    };

    reader.readAsText(file);
}

studybutton.addEventListener("click", function() {
    if (dailygoal < 1) {
        alert("Please set a valid goal first.");
        return;
    }

    studyhours = studyhours + 1;
    updateStudyText();
    updateStudyProgress();
    saveStudyData();
});

resetbutton.addEventListener("click", resetStudyHours);

setgoalbutton.addEventListener("click", function() {
    const enteredGoal = Number(goalinput.value);

    if (!isValidNumber(enteredGoal) || enteredGoal < 1) {
        alert("Please enter a valid daily goal of at least 1 hour.");
        return;
    }

    dailygoal = enteredGoal;
    updateStudyProgress();
    saveStudyData();
});

addjobbutton.addEventListener("click", function() {
    const company = companyinput.value.trim();
    const role = roleinput.value.trim();
    const location = locationinput.value.trim();
    const salary = salaryinput.value.trim();
    const url = urlinput.value.trim();
    const date = dateinput.value;
    const status = statusinput.value;
    const followUpDate = followupinput.value;
    const notes = notesinput.value.trim();

    if (!company || !role || !date) {
        alert("Please fill in Company Name, Job Role, and Application Date.");
        return;
    }

    if (followUpDate && !followUpDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        alert("Please enter a valid follow-up date.");
        return;
    }

    if (url && !/^https?:\/\//i.test(url)) {
        alert("Please enter a valid job posting URL starting with http:// or https://");
        return;
    }

    jobs.push({
        company,
        role,
        location,
        salary,
        url,
        date,
        status,
        followUpDate,
        notes,
        followUpCompleted: false,
        id: "job-" + Date.now()
    });

    companyinput.value = "";
    roleinput.value = "";
    locationinput.value = "";
    salaryinput.value = "";
    urlinput.value = "";
    dateinput.value = "";
    statusinput.value = "Applied";
    followupinput.value = "";
    notesinput.value = "";

    saveJobs();
    renderJobs();
    updateDashboardSummary();
});

jobsearch.addEventListener("input", renderJobs);
jobstatusfilter.addEventListener("change", renderJobs);
jobsort.addEventListener("change", renderJobs);

exportjobsbutton.addEventListener("click", exportJobsToCsv);
importjobsbutton.addEventListener("click", function() {
    csvfileinput.click();
});

csvfileinput.addEventListener("change", function(event) {
    const file = event.target.files && event.target.files[0];
    importJobsFromCsv(file);
    event.target.value = "";
});

navLinks.forEach(function(link) {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        const target = link.getAttribute("href").substring(1);
        showSection(target);
    });
});

summaryButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        const target = button.dataset.target;
        showSection(target);
    });
});

loadStudyData();
loadJobs();
updateStudyText();
updateStudyProgress();
updateDashboardSummary();
renderJobs();
showSection("dashboard");











