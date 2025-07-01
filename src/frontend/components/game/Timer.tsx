import { useEffect, useState } from "react";

export function Timer({ timeoutTime, visible }: { timeoutTime: number, visible: boolean }) {
  const [timestring, setTimestring] = useState<string>("");
  const updateTime = () => {
    const diff = timeoutTime - Date.now()
    const minutes = Math.floor(diff / 60000);
    const seconds = (diff - minutes * 60000) / 1000;

    setTimestring(`${minutes}:${seconds.toFixed(1)}`);
  }
  useEffect(() => {
    const i = setInterval(updateTime, 1000);
    return () => clearInterval(i);
  }, [timeoutTime])

  return (
    <div className={!visible || timeoutTime < 0 ? "hidden" : "m-4 text-md font-mono"}>
      <p>{timestring}</p>
    </div>
  )

}
