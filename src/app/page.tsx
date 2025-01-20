/*eslint-disable*/
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Add utility function for timestamp formatting
const formatTimestamp = (unixTimestamp: number) => {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    timeZone: "Asia/Bangkok",
    hour12: false,
  });
};

// Update Tweet interface
interface Tweet {
  id: string;
  text: string;
  user: string;
  label: string;
  time: number;
  formattedTime?: string;
}

interface Counters {
  Positive: number;
  Negative: number;
  Neutral: number;
  Total: number;
}

// Chart configuration
const chartConfig = {
  sentiment: {
    label: "Sentiment",
  },
  positive: {
    label: "Positive",
    color: "hsl(var(--chart-1))",
  },
  negative: {
    label: "Negative",
    color: "hsl(var(--chart-2))",
  },
  neutral: {
    label: "Neutral",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function Home() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [counters, setCounters] = useState<Counters>({
    Positive: 0,
    Negative: 0,
    Neutral: 0,
    Total: 0,
  });

  const rd = Math.floor(Math.random() * 100000);

  useEffect(() => {
    const ws = new WebSocket(`wss://karma.cloud.strixthekiet.me/api/${rd}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const tweetWithTime = {
        ...data,
        formattedTime: formatTimestamp(data.time),
      };
      setTweets((prev) => [tweetWithTime, ...prev].slice(0, 15));
      setCounters(data.counters);
    };

    return () => ws.close();
  }, []);

  const pieData = [
    {
      name: "Positive",
      value: counters.Positive,
      fill: chartConfig.positive.color,
    },
    {
      name: "Negative",
      value: counters.Negative,
      fill: chartConfig.negative.color,
    },
    {
      name: "Neutral",
      value: counters.Neutral,
      fill: chartConfig.neutral.color,
    },
  ];

  return (
    <div className="h-screen px-24 py-8 space-y-4">
      <h2 className="text-2xl text-center font-bold col-span-2">
        Machine Learning Project
      </h2>
      <div className="grid grid-cols-2 gap-4 h-min mb-4">
        {/* Metrics Section */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Metrics</h2>
          <div className="space-y-3 ">
            <div className="flex justify-between items-center">
              <span>Total Tweets:</span>
              <Badge variant="outline" className="text-md">
                {counters.Total}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Positive:</span>
              <Badge variant="success" className="text-md">
                {counters.Positive}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Negative:</span>
              <Badge variant="destructive" className="text-md">
                {counters.Negative}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Neutral:</span>
              <Badge variant="secondary" className="text-md">
                {counters.Neutral}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Chart Section */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-xl font-bold">
              Sentiment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square h-[200px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="value" hideLabel />}
                />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  labelLine
                  innerRadius={30}
                  outerRadius="80%"
                  paddingAngle={2}
                  label={({ name, value, percent }) =>
                    `${value} (${(percent * 100).toFixed(0)}%)`
                  }
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tweets Stream Section */}
      <Card className="h-[50vh]">
        <ScrollArea className="h-full p-4">
          <div className="space-y-3">
            {tweets.map((tweet, index) => (
              <Card
                key={tweet.id}
                className={`p-3 transition-all ${
                  tweet.label === "Positive"
                    ? "bg-green-50 text-green-700"
                    : tweet.label === "Negative"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold">@{tweet.user}</span>
                    <span className="text-xs opacity-75">
                      {tweet.formattedTime}
                    </span>
                  </div>
                  <p className="text-sm">{tweet.text}</p>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
