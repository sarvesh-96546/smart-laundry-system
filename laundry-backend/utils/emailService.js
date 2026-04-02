const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOrderReadyEmail = async (customerEmail, customerName, orderId) => {
    if (!process.env.RESEND_API_KEY) {
        return;
    }
    
    try {
        const { data, error } = await resend.emails.send({
            from: 'Pristine Flow <onboarding@resend.dev>',
            to: customerEmail,
            subject: `Laundry Protocol Complete: ${orderId} Ready`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; background-color: #f8fafc; border-radius: 12px; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #080808; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                        <span style="color: #8ff5ff; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Protocol Update</span>
                        <h1 style="color: white; margin: 10px 0 0 0; font-size: 24px; letter-spacing: -1px;">${orderId}</h1>
                    </div>
                    <div style="background-color: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                        <p style="color: #334155; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Hello <strong>${customerName}</strong>,</p>
                        <p style="color: #334155; font-size: 16px; line-height: 1.5;">Your laundry protocol has been successfully completed by our machines and is now <strong style="color: #10b981;">Ready for Pickup</strong>.</p>
                        <p style="color: #334155; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">Please visit our facility at your earliest convenience to retrieve your pristine items.</p>
                        
                        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                            <p style="color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Pristine Flow Networks</p>
                        </div>
                    </div>
                </div>
            `
        });

        if (error) {
        } else {
        }
    } catch (err) {
    }
};

module.exports = { sendOrderReadyEmail };
