const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 bg-base-100/50 min-h-[60vh] overflow-y-auto">
      <div className="w-full max-w-md text-center flex flex-col items-center justify-center gap-4">
        {/* SVG Div Section */}
        <div className="flex justify-center mb-2 w-full">
          <img
            src="/homepage.svg"
            alt="chat svg"
            className="w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 object-contain max-h-[40vh]"
            style={{ maxHeight: '240px' }}
          />
        </div>
        {/* Welcome Text */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Welcome to Chatify!</h2>
        <p className="text-base-content/60 text-sm sm:text-base md:text-lg block">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
