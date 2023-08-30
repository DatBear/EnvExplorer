import clsx from "clsx";

type FixedProgressBarProps = {
  className?: string;
  name: string;
  current: number;
  total: number;
}

export default function FixedProgressBar({ className, name, current, total }: FixedProgressBarProps) {
  var width = Math.min(100, Math.round(current / Math.max(1, total) * 100));
  className = clsx(className, 'fixed w-full h-4');
  return <div className={className}>
    <div className="bg-primary-700 h-full rounded-md" style={{ width: width + '%' }}></div>
    <div className="w-full h-full text-center text-xs text-white absolute top-0">{name}: {width}%</div>
  </div>
}