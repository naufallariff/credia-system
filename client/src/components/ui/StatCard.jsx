const StatCard = ({ title, value, color, subtext }) => {
    // Map color names to Tailwind classes dynamically
    const colorMap = {
        indigo: 'bg-indigo-100 text-indigo-600',
        green: 'bg-green-100 text-green-600',
        amber: 'bg-amber-100 text-amber-600',
        rose: 'bg-rose-100 text-rose-600',
        slate: 'bg-slate-100 text-slate-600'
    };

    const theme = colorMap[color] || colorMap.slate;

    return (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
                {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${theme}`}>
                <Icon size={24} />
            </div>
        </div>
    );
};

export default StatCard;