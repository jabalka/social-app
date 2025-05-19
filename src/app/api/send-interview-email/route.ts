// /app/api/send-interview-email/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  return NextResponse.json({ message: 'Email API reachable ✅' });
}

export async function POST() {
  try {
    const {  error } = await resend.emails.send({
      from: "onboarding@resend.dev", // or "onboarding@resend.dev" for testing
      to: "jabalkada@gmail.com",
      subject: "Interview Outcome - Jr Data Scientist",
      html: `
          <p>Dear Pavel,</p>
<p>Thank you for taking the time to interview with us for the Jr Data Scientist role on the 28th of April. </p>
<p>We truly appreciate the effort you put into the process and enjoyed learning more about your skills and experiences.</p>
<p>We are pleased to share that your interview went very well, </p>
<p>and you demonstrated strong potential for future opportunities with our company.</p> 
<p>However, after careful consideration, we have decided to proceed with another candidate </p>
<p>who has a stronger background in data science.</p>
<p>While we regret that we could not move forward with you at this time, </p>
<p>we would like to encourage you to stay connected with us, </p>
<p>as new positions will be opening next month that may align well with your skills. </p>
<p>We strongly encourage you to apply when these opportunities become available. </p>
<p>You can stay updated on these openings by following our account on Indeed, </p>
<p>where notifications will be posted as soon as new roles go live.</p>
<p>Thank you again for your interest in Information Tech Consultants. </p>
<p>We hope to have the opportunity to consider your application for future roles </p>
<p>and wish you the best in your job search.</p>
<p>Best regards,</p>
<p>Sam Tasali</p>
<p>Information Tech Consultants</p>
      `
    });


    if (error) {
      console.error("Resend API Error:", error); // 👈 log it
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Server error:", err); // 👈 log it
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
