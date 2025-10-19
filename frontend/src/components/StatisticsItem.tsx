import CountUp from './CountUp';

interface StatisticsItemProps {
  name: string;
  value: number;
  className?: string;
}

export default function StatisticsItem({ name, value, className = '' }: StatisticsItemProps) {
    return (
        <div className={`flex items-center justify-between py-1 px-3 rounded ${className}`}>
            <div className="text-sm text-slate-300 capitalize">{name}</div>
            <div className="text-lg font-mono text-white">
                <CountUp to={value} from={0} duration={0.6} className="inline-block" />
            </div>
        </div>
    );
}
