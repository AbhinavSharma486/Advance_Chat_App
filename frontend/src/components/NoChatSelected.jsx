
const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">

        {/* SVG Div Section */}
        <div className="flex justify-center mb-4">
          <img src="/homepage.svg" alt="chat svg" className="w-[450px] h-[450px]" />
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Welcome to ChitChat !</h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
