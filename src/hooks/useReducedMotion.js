import useMediaQuery from "./useMediaQuery";
import { mq } from "../utils/responsive";

export default function useReducedMotion() {
  return useMediaQuery(mq.reducedMotion);
}