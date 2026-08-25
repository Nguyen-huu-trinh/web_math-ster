import { resend } from "./resend";

interface Props {
  email: string;
  otp: string;
}

export async function sendPasswordResetEmail({
  email,
  otp,
}: Props) {
  const { data, error } =
    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL!,
      to: [email],

      subject:
        "Mã xác thực khôi phục mật khẩu - Mathster",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
          "
        >
          <h2>
            Khôi phục mật khẩu
          </h2>

          <p>
            Bạn vừa yêu cầu khôi phục mật khẩu
            tài khoản Mathster.
          </p>

          <p>
            Mã xác thực của bạn là:
          </p>

          <div
            style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 24px 0;
            "
          >
            ${otp}
          </div>

          <p>
            Mã có hiệu lực trong
            <strong>5 phút</strong>.
          </p>

          <p>
            Nếu bạn không yêu cầu khôi phục
            mật khẩu, hãy bỏ qua email này.
          </p>

          <hr />

          <p
            style="
              color: #888;
              font-size: 12px;
            "
          >
            Mathster
          </p>
        </div>
      `,
    });

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data;
}