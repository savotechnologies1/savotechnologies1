import { useEffect, useState } from "react";
import { Grid } from "antd";
import { isEmpty } from "lodash-es";
const { useBreakpoint } = Grid;

export default function useCurrentScreen() {
  const screens = useBreakpoint();
  const [currentPoint, setCurrentPoint] = useState("");

  useEffect(() => {
    let arr = Object.entries(screens).filter((screen) => {
      if (!!screen[1]) {
        return screen[1];
      }
    });
    let result = arr[arr.length - 1];
    if (result) {
      setCurrentPoint(result[0]);
    }
  }, [screens]);

  if (!isEmpty(currentPoint)) {
    return currentPoint;
  }
}
