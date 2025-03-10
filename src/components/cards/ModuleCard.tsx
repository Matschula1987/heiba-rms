interface Stat {
  label: string;
  value: string;
}

interface ModuleCardProps {
  title: string;
  subtitle: string;
  icon: string;
  matchRate?: number;
  stats: Stat[];
  onClick?: () => void;
}

export default function ModuleCard({
  title,
  subtitle,
  icon,
  matchRate,
  stats,
  onClick,
}: ModuleCardProps) {
  return (
    <div
      className="bg-white p-6 rounded-none shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-[var(--primary-dark)]/10 flex items-center justify-center">
          <i className={`fas fa-${icon} text-[var(--accent)] text-xl`}></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--primary-dark)]">{title}</h2>
          <p className="text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-600">{stat.label}</span>
            <span className="font-semibold">{stat.value}</span>
          </div>
        ))}
        {matchRate && (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-[var(--accent)] h-2 rounded-full"
                style={{ width: `${matchRate}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-500">Match-Rate: {matchRate}%</span>
          </>
        )}
      </div>
    </div>
  );
}
