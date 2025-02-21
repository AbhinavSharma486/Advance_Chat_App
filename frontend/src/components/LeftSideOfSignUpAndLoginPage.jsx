import { motion } from "framer-motion";

const bounceTransition = {
  y: {
    duration: 2,
    repeat: Infinity,
    repeatType: "Infinity",
    ease: "easeInOut",
  },
};


const LeftSideOfSignUpAndLoginPage = ({ title, subtitle, mode }) => {
  const imageSrc = mode === "login" ? "/login.svg" : "/sign-up-animate.svg";

  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">
        <motion.div
          className="mb-5"
          animate={{ y: [0, -25, 0] }}
          transition={bounceTransition}
        >
          <img src={imageSrc} alt={`${mode} svg`} />
        </motion.div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default LeftSideOfSignUpAndLoginPage;
