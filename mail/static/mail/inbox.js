document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // Handle form submission
    document.querySelector('#compose-form').addEventListener('submit', send_email);

    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').innerHTML = '';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#email-view').innerHTML = '';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

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
                <div style="border-bottom: 1px solid #ddd;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h5 style="margin: 0;"><b>${singleEmail.sender}</b></h5>
                        <p style="margin: 0;">${formattedEmailDate}</p>
                    </div>
                    <h6><b>${singleEmail.subject}</b></h6>
                    <h6 class="email-body-preview">${singleEmail.body}</h6>
                </div>
            `;

            // Add event listener using a separate function
            newEmail.addEventListener('click', () => view_email(singleEmail.id));

            // Append email to the emails-view container
            document.querySelector('#emails-view').append(newEmail);
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
        load_mailbox('sent');  // After sending, load the "Sent" mailbox
    });
}

function view_email(email_id) {
    // This function will handle the email click event
    console.log(`This element has been clicked! Email ID: ${email_id}`);

    document.querySelector('#email-view').innerHTML = '';
    document.querySelector('#email-view').innerHTML = `<h3>Mail</h3>`;


    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
        console.log(email);
        const newEmail = document.createElement('div');

        const formattedBody = email.body.replace(/\n/g, '<br>');

        newEmail.innerHTML = `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h5 style="margin: 0;"><b>${email.sender}</b></h5>
                    <p style="margin: 0;">${email.timestamp}</p>
                </div>
                <h6><b>${email.subject}</b></h6>
                <h6>${formattedBody}</h6>
            </div>
        `;


        document.querySelector('#email-view').append(newEmail);
    });
}
