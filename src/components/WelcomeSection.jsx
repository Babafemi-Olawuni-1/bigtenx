export default function WelcomeSection({ user }) {
  return (
    <div className="px-5 pt-4 pb-2">
      <p className="text-[#001F54] dark:text-[#3b82f6] text-sm font-medium">Welcome back 👋</p>
      <p className="text-2xl font-extrabold">
        Hi <span className="text-[#ff6f00]">{user.username}</span>
      </p>
    </div>
  )
}
