import GlobalException from "./GlobalException";

class UnauthorizedException extends GlobalException {
  constructor(message = "관리자 인증이 필요합니다.") {
    super(message);
    this.name = "UnauthorizedException";
    this.statusCode = 401;
  }
}

export default UnauthorizedException;
