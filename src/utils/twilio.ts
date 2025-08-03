import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const sendSMS = async (
  to: string,
  message: string
): Promise<boolean> => {
  try {
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });
    return true;
  } catch (error) {
    console.error("SMS sending failed:", error);
    return false;
  }
};

export const sendTaskReminder = async (
  phoneNumber: string,
  taskTitle: string,
  dueDate: Date
): Promise<boolean> => {
  const formattedDate = dueDate.toLocaleDateString();
  const message = `Task Reminder: "${taskTitle}" is due on ${formattedDate}. Please complete it on time.`;

  return await sendSMS(phoneNumber, message);
};
