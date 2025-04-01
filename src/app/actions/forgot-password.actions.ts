// "use server";

// import prisma from "@/prisma";
// import { AuthSlide } from "@/types/auth-slide.enum";
// import { bytesToHex, randomBytes } from "@/utils/crypto.utils";
// import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
// import { Resource } from "sst";

// export async function requestPasswordReset(email: string) {
//   const user = await prisma.user.findUnique({
//     where: { email },
//   });

//   if (!user) {
//     return { error: "User not found" };
//   }

//   const resetToken = bytesToHex(randomBytes(32));
//   const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

//   await prisma.user.update({
//     where: { email },
//     data: {
//       resetToken,
//       resetTokenExpiry,
//     },
//   });

//   const resetUrl =
//     process.env.NODE_ENV === "development"
//       ? `http://localhost:${process.env.PORT}/auth?slide=${AuthSlide.RESET_PASSWORD}&token=${resetToken}`
//       : `${Resource.StarckEmail.sender}/auth?slide=${AuthSlide.RESET_PASSWORD}&token=${resetToken}`;


//       const verificationUrl =
//       process.env.NODE_ENV === "development"
//         ? `http://localhost:${process.env.PORT ?? 3000}/api/auth/verify?token=${token}`
//         : `https://yourdomain.com/api/auth/verify?token=${token}`;

//   await sendPasswordResetEmail(email, resetUrl);

//   return { success: "Reset password link sent to your email" };
// }

// async function sendPasswordResetEmail(email: string, resetUrl: string) {
//   const client = new SESv2Client();

//   await client.send(
//     new SendEmailCommand({
//       FromEmailAddress: process.env.EMAIL_FROM!,
//       Destination: {
//         ToAddresses: [email],
//       },
//       Content: {
//         Simple: {
//           Subject: { Data: "Reset your password", Charset: "UTF-8" },
//           Body: {
//             Html: {
//               Charset: "UTF-8",
//               Data: `
//               <p>Click the link below to reset your password:</p>
//               <a href="${resetUrl}">Reset password</a>
//               <p>If you didn't request this email, you can safely ignore it.</p>
//             `,
//             },
//           },
//         },
//       },
//     }),
//   );
// }
