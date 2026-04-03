const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Pristine Flow <protocols@zeroepoch.dev>';

const baseStyle = `
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1a1a1a;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
`;

const headerStyle = `
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    padding: 48px 32px;
    text-align: center;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
`;

const contentStyle = `
    padding: 48px 32px;
    border: 1px solid #e2e8f0;
    border-top: none;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
`;

const footerStyle = `
    padding-top: 32px;
    text-align: center;
    color: #64748b;
    font-size: 13px;
`;

const badgeStyle = (status) => {
    const colors = {
        'Pending': { bg: '#f1f5f9', text: '#475569' },
        'Washing': { bg: '#e0f2fe', text: '#0369a1' },
        'Drying': { bg: '#fef3c7', text: '#92400e' },
        'Ironing': { bg: '#fdf2f8', text: '#be185d' },
        'Ready': { bg: '#dcfce7', text: '#15803d' },
        'Completed': { bg: '#dcfce7', text: '#15803d' },
        'Delivered': { bg: '#f1f5f9', text: '#020617' }
    };
    const color = colors[status] || colors['Pending'];
    return `display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.025em; background-color: ${color.bg}; color: ${color.text};`;
};

const sendWelcomeEmail = async (customerEmail, customerName) => {
    if (!process.env.RESEND_API_KEY) return;
    try {
        await resend.emails.send({
            from: fromEmail,
            to: customerEmail,
            subject: 'Welcome to Pristine Flow Networks',
            html: `
                <div style="${baseStyle}">
                    <div style="${headerStyle}">
                        <div style="color: #38bdf8; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 8px;">Network Initialization</div>
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: -0.02em;">Welcome, ${customerName}</h1>
                    </div>
                    <div style="${contentStyle}">
                        <p style="font-size: 16px; margin-bottom: 24px;">Your journey with <strong>Pristine Flow</strong> begins here. We've initialized your profile in our global network, ready to manage your garment protocols with surgical precision.</p>
                        <p style="font-size: 16px; margin-bottom: 32px;">Access your portal to schedule your first pickup and experience the future of professional garment management.</p>
                        <div style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL}/" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none;">Launch Client Portal</a>
                        </div>
                        <div style="${footerStyle}">
                            <p>© 2026 Pristine Flow Networks. All systems operational.</p>
                        </div>
                    </div>
                </div>
            `
        });
    } catch (err) {
    }
};

const sendOrderConfirmationEmail = async (customerEmail, customerName, orderId, serviceType) => {
    if (!process.env.RESEND_API_KEY) return;
    try {
        await resend.emails.send({
            from: fromEmail,
            to: customerEmail,
            subject: `Protocol Activated: ${orderId}`,
            html: `
                <div style="${baseStyle}">
                    <div style="${headerStyle}">
                        <div style="color: #38bdf8; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 8px;">Sequence Initiated</div>
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Protocol ${orderId}</h1>
                    </div>
                    <div style="${contentStyle}">
                        <p style="font-size: 16px; margin-bottom: 24px;">Hello ${customerName}, your request for <strong>${serviceType}</strong> has been logged into our processing queue. Our specialized machinery is being prepared for your service.</p>
                        <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #e2e8f0;">
                            <div style="margin-bottom: 12px;">
                                <span style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Tracking ID</span><br/>
                                <strong style="font-size: 18px; color: #0f172a;">${orderId}</strong>
                            </div>
                            <div>
                                <span style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Current Phase</span><br/>
                                <span style="${badgeStyle('Pending')}">Awaiting Processing</span>
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL}/order/${orderId}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none;">Track Protocol Progress</a>
                        </div>
                        <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 24px;">You will receive automated transmission updates as your items transition through their respective protocols.</p>
                    </div>
                </div>
            `
        });
    } catch (err) {
    }
};

const sendOrderStatusUpdateEmail = async (customerEmail, customerName, orderId, status) => {
    if (!process.env.RESEND_API_KEY) return;
    try {
        await resend.emails.send({
            from: fromEmail,
            to: customerEmail,
            subject: `Sub-system Update: ${orderId} is ${status}`,
            html: `
                <div style="${baseStyle}">
                    <div style="${headerStyle}">
                        <div style="color: #38bdf8; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 8px;">Protocol Advancement</div>
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Sequence ${orderId}</h1>
                    </div>
                    <div style="${contentStyle}">
                        <p style="font-size: 16px; margin-bottom: 24px;">Protocol for ${customerName} has successfully transitioned. Operational status update:</p>
                        <div style="text-align: center; margin-bottom: 32px;">
                            <div style="${badgeStyle(status)}; font-size: 24px; padding: 12px 32px;">${status}</div>
                        </div>
                        <p style="font-size: 16px; color: #64748b; line-height: 1.6;">Our industrial-grade precision systems are currently managing your garments. No manual intervention is required at this stage.</p>
                        <div style="text-align: center; margin-top: 32px;">
                            <a href="${process.env.FRONTEND_URL}/order/${orderId}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none;">Monitor Real-time Stream</a>
                        </div>
                    </div>
                </div>
            `
        });
    } catch (err) {
    }
};

const sendOrderReadyEmail = async (customerEmail, customerName, orderId) => {
    if (!process.env.RESEND_API_KEY) return;
    try {
        await resend.emails.send({
            from: fromEmail,
            to: customerEmail,
            subject: `Treatment Concluded: ${orderId}`,
            html: `
                <div style="${baseStyle}">
                    <div style="${headerStyle}">
                        <div style="color: #10b981; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 8px;">Sequence Complete</div>
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${orderId} is Ready</h1>
                    </div>
                    <div style="${contentStyle}">
                        <p style="font-size: 16px; margin-bottom: 24px;">Congratulations ${customerName}, your garments have successfully passed all quality checkpoints and are now awaiting retrieval.</p>
                        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px;">
                            <span style="color: #15803d; font-weight: 700; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">Ready for Retrieval</span>
                        </div>
                        <p style="font-size: 16px; margin-bottom: 32px;">Please visit the facility during operational hours to retrieve your items. They have been returned to peak condition.</p>
                        <div style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL}/order/${orderId}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none;">Get Retrieval Details</a>
                        </div>
                    </div>
                </div>
            `
        });
    } catch (err) {
    }
};

const sendOrderDeliveredEmail = async (customerEmail, customerName, orderId) => {
    if (!process.env.RESEND_API_KEY) return;
    try {
        await resend.emails.send({
            from: fromEmail,
            to: customerEmail,
            subject: `Handover Success: ${orderId}`,
            html: `
                <div style="${baseStyle}">
                    <div style="${headerStyle}">
                        <div style="color: #38bdf8; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 8px;">Protocol Finalized</div>
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Archive: ${orderId}</h1>
                    </div>
                    <div style="${contentStyle}">
                        <p style="font-size: 16px; margin-bottom: 24px;">Hello ${customerName}, Protocol ${orderId} has been successfully finalized. Your items have been returned to your care.</p>
                        <p style="font-size: 16px; color: #64748b; margin-bottom: 32px;">Thank you for utilizing the <strong>Pristine Flow</strong> infrastructure. We've archived this sequence and look forward to your next request.</p>
                        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                            <p style="color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Pristine Flow Networks // End of Transmission</p>
                        </div>
                    </div>
                </div>
            `
        });
    } catch (err) {
    }
};

module.exports = { 
    sendWelcomeEmail, 
    sendOrderConfirmationEmail, 
    sendOrderStatusUpdateEmail, 
    sendOrderReadyEmail,
    sendOrderDeliveredEmail
};
