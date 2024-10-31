document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox-tab').addEventListener('click', () => {
        setActiveTab('inbox');
        load_mailbox('inbox');
    });
    document.querySelector('#sent-tab').addEventListener('click', () => {
        setActiveTab('sent');
        load_mailbox('sent');
    });
    document.querySelector('#archived-tab').addEventListener('click', () => {
        setActiveTab('archived');
        load_mailbox('archive');
    });
    document.querySelector('#compose-tab').addEventListener('click', () => {
        setActiveTab('compose');
        compose_email();
    });

    // Handle form submission
    document.querySelector('#compose-form').addEventListener('submit', send_email);

    // By default, load the inbox
    setActiveTab('inbox');
    load_mailbox('inbox');
});

// Function to set the active tab
function setActiveTab(tab) {
    // Remove 'active' class from all tabs
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Add 'active' class to the current tab
    document.querySelector(`#${tab}-tab`).classList.add('active');
}

function compose_email() {
    // Show compose view and hide other views
    document.querySelector('#mailbox-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

let selectedEmail = null;
function load_mailbox(mailbox) {
    // Show the mailbox and hide other views
    document.querySelector('#mailbox-view').style.display = 'flex';
    document.querySelector('#compose-view').style.display = 'none';

    // Clean old emails previews and email view
    document.querySelector('#email-previews').innerHTML = '';
    document.querySelector('#email-view').innerHTML = '';

    // Show the mailbox name
    document.querySelector('#mailbox-name').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // Get mails
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        emails.forEach(singleEmail => {
            const newEmail = document.createElement('div');

            // Format the email date
            const emailDate = new Date(singleEmail.timestamp);
            const currentDate = new Date();

            let formattedEmailDate;
            if (emailDate.toDateString() === currentDate.toDateString()) {
                // Same day, show time
                formattedEmailDate = emailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
                // Different day, show date
                formattedEmailDate = emailDate.toLocaleDateString();
            }

            // Construct the email item content
            newEmail.innerHTML = `
                <div class="email-preview">
                    <div style="flex-grow: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h5><b>${singleEmail.sender}</b></h5>
                            <p>${formattedEmailDate}</p>
                        </div>
                        <h6><b>${singleEmail.subject}</b></h6>
                        <p class="email-body-preview">${singleEmail.body}</p>
                    </div>
                </div>
            `;

            // Get reference to the email-preview element inside newEmail
            const emailPreview = newEmail.querySelector('.email-preview');

            // Set background color for unread emails
            if (!singleEmail.read) {
                emailPreview.style.backgroundColor = '#505050';
            }

            // Add event listener using a separate function
            newEmail.addEventListener('click', () => {
                // Reset the background color of the previously selected email
                if (selectedEmail) {
                    selectedEmail.style.backgroundColor = ''; // Reset previous color
                }
                // Set new background color for the selected email-preview
                emailPreview.style.backgroundColor = '#007bff';
                selectedEmail = emailPreview; // Update the selected email variable

                // Open the email and mark it as read
                view_email(singleEmail.id);
            });

            // Append email to the emails-view container
            document.querySelector('#email-previews').append(newEmail);
        });

        console.log(emails);
    });
}

function send_email(event) {
    event.preventDefault();

    // Logic to send the email
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients,
            subject: subject,
            body: body
        })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        setActiveTab('sent');
        load_mailbox('sent');  // After sending, load the "Sent" mailbox
    });
}

function view_email(email_id) {
    // This function will handle the email click event
    console.log(`This element has been clicked! Email ID: ${email_id}`);

    document.querySelector('#email-view').innerHTML = '';

    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    })
    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
        console.log(email);
        const newEmail = document.createElement('div');

        const formattedBody = email.body.replace(/\n/g, '<br>');

        newEmail.innerHTML = `

            <div class='email-head'>
                <h5>From:<b> ${email.sender}</b></h5>
                <p>Time of sending: ${email.timestamp}</p>
            </div>
            <div class='email-body'>
                <h6>Subject: <b>${email.subject}</b></h6>
                <h6>${formattedBody}</h6>
            </div>

            <div class='email-options-bar'>
                <button class='button-icon' id="archive-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="10" width="18" height="10" stroke="white" stroke-width="2" />
                        <rect x="5" y="4" width="14" height="4" fill="white" />
                    </svg>
                </button>
                <button class='button-icon' id="reply-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 5L4 12L10 19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M20 18C20 14 18 12 12 12H4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
        `;

        document.querySelector('#email-view').append(newEmail);

        // Add event listener for the archive button
        document.querySelector('#archive-button').addEventListener('click', () => {
            archive_email(email);
        });

        document.querySelector('#reply-button').addEventListener('click', () => {
            reply_email(email);
        });
    });
}

function archive_email(email) {
    fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !email.archived
        })

    })
    .then(() => {
        // Reload the inbox or archive mailbox after archiving
        setActiveTab('inbox');
        load_mailbox('inbox');
    });
}

function reply_email(email) {
    setActiveTab('compose');
    compose_email();
    document.querySelector('#compose-recipients').value = email.sender;

    // Check if the subject already starts with "Re:"
    if (!email.subject.startsWith("Re:")) {
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    } else {
        document.querySelector('#compose-subject').value = email.subject;
    }
    // Format the original email's timestamp
    const emailDate = new Date(email.timestamp);
    const formattedDate = emailDate.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });

    // Pre-fill the body with the original email text
    const replyLine = `\n\nOn ${formattedDate}, ${email.sender} wrote:\n${email.body}`;
    document.querySelector('#compose-body').value = replyLine;
}