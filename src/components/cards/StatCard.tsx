interface StatCardProps {
  title: string;
  value: number;
  icon: string;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-none shadow-md hover-scale">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-[var(--primary-dark)] mt-2">{value}</h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-[var(--primary-dark)]/10 flex items-center justify-center">
          <i className={`fas fa-${icon} text-[var(--accent)] text-xl`}></i>
        </div>
      </div>
    </div>
  );
}
