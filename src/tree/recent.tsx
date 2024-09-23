import React, { useState, useEffect } from "react";
import {
  Slider,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

interface RecentFolder {
  path: string;
  lastUsed: Date;
}

const RecentFolders: React.FC = () => {
  const [recentFolders, setRecentFolders] = useState<RecentFolder[]>([]);
  const [timeRange, setTimeRange] = useState<number>(30); // デフォルトは1ヶ月

  useEffect(() => {
    // ここでTauri側から最近使用したフォルダのリストを取得する
    // この例ではダミーデータを使用
    const dummyData: RecentFolder[] = [
      { path: "/Users/example/Documents", lastUsed: new Date(2023, 5, 1) },
      { path: "/Users/example/Downloads", lastUsed: new Date(2023, 4, 15) },
      { path: "/Users/example/Desktop", lastUsed: new Date(2023, 3, 20) },
      // ... more folders
    ];
    setRecentFolders(dummyData);
  }, []);

  const filterFolders = (folders: RecentFolder[], days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return folders.filter((folder) => folder.lastUsed >= cutoffDate);
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setTimeRange(newValue as number);
  };

  const displayFolders = filterFolders(recentFolders, timeRange);

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        最近使用したフォルダ
      </Typography>
      <Slider
        value={timeRange}
        onChange={handleSliderChange}
        aria-labelledby="time-range-slider"
        valueLabelDisplay="auto"
        step={null}
        marks={[
          { value: 30, label: "1ヶ月" },
          { value: 90, label: "3ヶ月" },
          { value: 365, label: "1年" },
        ]}
        min={30}
        max={365}
      />
      <Card style={{ marginTop: "20px" }}>
        <CardContent>
          <List>
            {displayFolders.map((folder, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={folder.path}
                  secondary={`最終使用日: ${folder.lastUsed.toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentFolders;
