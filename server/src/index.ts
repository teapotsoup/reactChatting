import * as express from "express";
import { init, room, roomT, getUniqueID } from "./chatting";
import * as bodyParser from "body-parser";

//#1. 서버 기본 설정 입니다.
//익스프레스 객체 입니다.
const app: express.Application = express();
{
  init(new Map<string, roomT>()); //웹소캣 서버를 구동 합니다.
}

//#2. 뷰 설정 입니다.
app.set("views", "D:/reactWithApp/server/html");
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

//#3. post 파라미터 파싱부분 입니다.
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//#4. 화면 페이지로 이동시킵니다.
app.all("/", (req: express.Request, res: express.Response) => {
  res.render("index.html", { title: "Welcome" });
});

//#5. 간단하게 구현한 로그인 관련 내용 입니다.
const db = new Map<string, string>(); //데이터 베이스용 map 객체 입니다.
app.all("/data/joinOrLogIn", (req: express.Request, res: express.Response) => {
  let { id, password, join } = req.body;
  id = id.toString();
  if (join) {
    //회원가입
    if (!db.get(id)) {
      db.set(id, password);
      res.set(id, password.toString());
      res.send({ result: "OK" });
    } else {
      res.send({ result: "ID IS EXSIST" });
    }
  } else {
    //로그인
    if (!db.get(id)) {
      res.send({ result: "no member" });
    } else if (db.get(id) && db.get(id) != password) {
      res.send({ result: "wrong password" });
    } else {
      res.send({ result: "OK" });
    }
  }
});

//#6. 채팅방 목록을 받습니다. ----------------
app.all("/data/getRoomList", (req: express.Request, res: express.Response) => {
  let arr: Array<any> = []; //고민해야 되는 것은 요청에 따라 매번 반복문이 동작해야 된다는 점 입니다..
  room.forEach((value, key) => {
    let { kor, password, _room_id } = value;
    arr.push({ key, kor, password, _room_id, size: value.list.length });
  });
  res.send(JSON.stringify(arr));
});

//#7. 방을 개설합니다.
app.all("/data/createRoom", (req: express.Request, res: express.Response) => {
  let { kor, password, _id }: roomT = req.body;
  let rommId = getUniqueID();
  let array = new Array();
  room.set(rommId, {
    kor: kor,
    password: password,
    _room_id: rommId,
    list: array,
  });
  res.send(JSON.stringify({ result: "succ", _room_id: rommId }));
});

//#8. 서버를 실행 합니다.
app.listen(4885, () => {
  console.log("실행중");
});
