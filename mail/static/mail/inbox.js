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
    document.querySelector('#email-previews').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

let selectedEmail = null;
function load_mailbox(mailbox) {
    // Show the mailbox and hide other views
    document.querySelector('#email-previews').style.display = 'block';
    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#email-previews').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

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
    document.querySelector('#email-view').innerHTML = `<h3>Mail</h3>`;

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
            <div>
                <div class='email-head'>
                    <h5>From:<b> ${email.sender}</b></h5>
                    <p>Time of sending: ${email.timestamp}</p>
                </div>
                <div class='email-body'>
                    <h6>Subject: <b>${email.subject}</b></h6>
                    <h6>${formattedBody}</h6>
                </div>
            </div>
        `;


        document.querySelector('#email-view').append(newEmail);
    });
}