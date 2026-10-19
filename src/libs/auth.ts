import { getIsAdmin } from "@/app/actions";
import UnauthorizedException from "@/exceptions/UnauthorizedException";

// Server Action은 레이아웃 검사를 거치지 않으므로 액션마다 직접 확인한다
export async function assertAdmin() {
  if (!(await getIsAdmin())) throw new UnauthorizedException();
}
