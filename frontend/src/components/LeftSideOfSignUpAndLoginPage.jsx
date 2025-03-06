import { motion } from "framer-motion";

const bounceTransition = {
  y: {
    duration: 2,
    repeat: Infinity,
    repeatType: "mirror", // Fixes animation repeat behavior
    ease: "easeInOut",
  },
};

const LeftSideOfSignUpAndLoginPage = ({ title, subtitle, mode }) => {
  const imageSrc =
    mode === "login"
      ? "/login.svg"
      : mode === "signup"
        ? "/sign-up.svg"
        : mode === "forget-password"
          ? "/forget-password.svg"
          : mode === "reset-password"
            ? "/reset-password.svg"
            : mode === "otp"
              ? "/otp.svg"
              : "";

  return (
    <div className="hidden lg:flex flex-col items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center flex flex-col items-center">

        {/* Fixed-size Image Container */}
        <div className="w-[450px] h-[450px] flex justify-center items-center overflow-hidden mb-5">
          <motion.img
            src={imageSrc}
            alt={`${mode} illustration`}
            className="w-full h-full object-contain"
            animate={{ y: [0, -25, 0] }}
            transition={bounceTransition}
          />
        </div>

        {/* Title and Subtitle */}
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default LeftSideOfSignUpAndLoginPage;
