import { DynamicLoader, Version } from 'bcdice';

let GameSystem: game_system;
const loader = new DynamicLoader();
loader.dynamicLoad('Cthulhu7th').then((v) => {
  GameSystem = v;
});

function getDiceroll(command: string): string{
  const result = GameSystem.eval(command);
  if(!result) return "";
  return result.text;
}

function getDiceVersion(): string{
  return Version;
}

const htmlDecode = function(str: string) {
  return str.replace("&amp;", '&').replace("&gt;", '>').replace(
        "&lt;", '<').replace("&quot", "'").replace("&#39",
        "'");/*from w  w  w.  j  ava2 s.c o m*/
};

const helpMes = `・判定　CC(x)<=（目標値）
　x：ボーナス・ペナルティダイス。省略可。
　目標値が無くても1D100は表示される。
　ファンブル／失敗／　レギュラー成功／ハード成功／
　イクストリーム成功／クリティカル を自動判定。
　例）CC<=30　CC(2)<=50 CC(+2)<=50 CC(-1)<=75 CC-1<=50 CC1<=65 CC+1<=65 CC
・技能ロールの難易度指定　CC(x)<=(目標値)(難易度)
　目標値の後に難易度を指定することで
　成功／失敗／クリティカル／ファンブル を自動判定する。
　難易度の指定：
　　r:レギュラー　h:ハード　e:イクストリーム　c:クリティカル
　例）CC<=70r CC1<=60h CC-2<=50e CC2<=99c
・組み合わせ判定　(CBR(x,y))
　目標値 x と y で％ロールを行い、成否を判定。
　例）CBR(50,20)
・自動火器の射撃判定　FAR(w,x,y,z,d,v)
　w：弾丸の数(1～100）、x：技能値（1～100）、y：故障ナンバー、
　z：ボーナス・ペナルティダイス(-2～2)。省略可。
　d：指定難易度で連射を終える（レギュラー：r,ハード：h,イクストリーム：e）。省略可。
　v：ボレーの弾丸の数を変更する。省略可。
　命中数と貫通数、残弾数のみ算出。ダメージ算出はありません。
例）FAR(25,70,98)　FAR(50,80,98,-1)　far(30,70,99,1,R)
　　far(25,88,96,2,h,5)　FaR(40,77,100,,e,4)　fAr(20,47,100,,,3)
・各種表
　【狂気関連】
　・狂気の発作（リアルタイム）（Bouts of Madness Real Time）　BMR
　・狂気の発作（サマリー）（Bouts of Madness Summary）　BMS
　・恐怖症（Sample Phobias）表　PH／マニア（Sample Manias）表　MA
　【魔術関連】
　・プッシュ時のキャスティング・ロール（Casting Roll）の失敗表
　　強力でない呪文の場合　FCL／強力な呪文の場合　FCM
  
システム共通コマンド
3D6+1>=9 ：3d6+1で目標値9以上かの判定
1D100<=50 ：D100で50％目標の下方ロールの例
3U6[5] ：3d6のダイス目が5以上の場合に振り足しして合計する(上方無限)
3B6 ：3d6のダイス目をバラバラのまま出力する（合計しない）
10B6>=4 ：10d6を振り4以上のダイス目の個数を数える
(8/2)D(4+6)<=(5*3)：個数・ダイス・達成値には四則演算も使用可能
C(10-4*3/2+2)：C(計算式）で計算だけの実行も可能
choice[a,b,c]：列挙した要素から一つを選択表示。ランダム攻撃対象決定などに
S3d6 ：各コマンドの先頭に「S」を付けると他人には見えないシークレットロール
3d6/2 ：ダイス出目を割り算（切り捨て）切り上げは /2U、四捨五入は /2R
D66 ：D66ダイス。順序はゲームに依存（D66N：そのまま、D66S：昇順）
https://docs.bcdice.org/`;

import twitter from "twit";

const consumer_key = process.env.CONSUMER_KEY;
const consumer_secret = process.env.CONSUMER_SECRET;
const access_token = process.env.ACCESS_TOKEN_KEY;
const access_token_secret = process.env.ACCESS_TOKEN_SECRET;


if(!consumer_key || !consumer_secret){
  console.log("Error: Invaid Consumer Key or Secret");
  process.exit();
}
if(!access_token || !access_token_secret){
  console.log("Error: Invaid AccessToken Key or Secret");
  process.exit();
}

const twitterClient = new twitter({
  consumer_key: consumer_key,
  consumer_secret: consumer_secret,
  access_token: access_token,
  access_token_secret: access_token_secret
});

function postTweet(content: string, replyId: string, callback: twitter.Callback){
  twitterClient.post("statuses/update", {status: content, in_reply_to_status_id: replyId}, callback);
}

function sendDM(content: string, senderId: string, callback: twitter.Callback){
  twitterClient.post("direct_messages/events/new", {
    event: {
      type: "message_create",
      message_create: {
        target: {
          recipient_id: senderId
        },
        message_data: {
          text: content
        }
      }
    }
  } as twitter.Params, callback);
}

import express, { Request, Response } from "express";
import crypto from "crypto";
import game_system from 'bcdice/lib/game_system';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  try {
    res.sendStatus(404);
  } catch (error) {
    res.sendStatus(500);
  }
});

app.get('/version', (req: Request, res: Response) => {
  try {
    res.send({ version: getDiceVersion() });
  } catch (error) {
    res.sendStatus(500);
  }
});

interface WebhookGetRequest extends Request {
  query: {
    crc_token: string | undefined
  }
}

interface TweetCreateEvent {
  id: string,
  retweeted_status: any | undefined,
  user: {
    id_str: string,
    screen_name: string
  },
  entities: {
    user_mentions: Array<{id_str: string}>
  },
  text: string,

}

interface DirectMessageEvent{
  message_create: {
    sender_id: string,
    message_data: {
      text: string
    }
  }
}

interface WebhookPostRequest extends Request {
  body: {
    tweet_create_events: Array<TweetCreateEvent> | undefined,
    direct_message_events: Array<DirectMessageEvent> | undefined
  }
}

app.get('/webhook', (req: WebhookGetRequest, res: Response) => {
  try {
    if(!req.query.crc_token) res.sendStatus(400);
    else{
      const hmac = crypto.createHmac('sha256', consumer_secret).update(req.query.crc_token).digest('base64');
      res.send({ response_token: "sha256=" + hmac });
    }
  } catch (error) {
    console.log("191",error);
    res.sendStatus(500);
  }
});

app.post('/webhook', (req: WebhookPostRequest, res: Response, next) => {
  try{
    if(req.body.tweet_create_events){
      req.body.tweet_create_events.forEach((ev) => {
        if(!ev.entities.user_mentions.every((m) => m.id_str !== "1461318388433956865")){
          if(ev.user.id_str !== "1461318388433956865"){
            const text = htmlDecode(decodeURIComponent(ev.text));
            if(text.includes(" ")){
              let reqTxt = "";
              text.split(" ").forEach((c) => {
                if(c.slice(0,1) != "@"){
                  reqTxt += c;
                  reqTxt += " ";
                }
              });
              let resTxt = getDiceroll(reqTxt);
              if(resTxt){
                let resTxt2 = "@" + ev.user.screen_name + " " + resTxt;
                if(resTxt2.length >= 140){
                  resTxt2 = resTxt.slice(0,139) + "…";
                  sendDM("リプライの続き："+resTxt, ev.user.id_str, (er) => {
                    postTweet(resTxt2, ev.id, () => {
                      res.send({data: "success"});
                    });
                  });
                }
                else{
                  postTweet(resTxt2, ev.id, () => {
                    res.send({data: "success"});
                  });
                }
              }
              else{
                postTweet("@" + ev.user.screen_name + " エラー：コマンドが正しくありません。", ev.id, () => {
                  res.send({data: "error"});
                })
              }
            }
          }
        }
      })
    }
    if(req.body.direct_message_events){
      req.body.direct_message_events.forEach((ev) => {
        console.log(ev);
        if(ev.message_create.sender_id != "1461318388433956865"){
          const text = htmlDecode(decodeURIComponent(ev.message_create.message_data.text));
          if(text.startsWith("help")){
            sendDM(helpMes, ev.message_create.sender_id, () => {
              res.send({data: "success"});
            });
          }
          else{
            let resTxt = getDiceroll(text);
            if(resTxt != ""){
              sendDM(resTxt, ev.message_create.sender_id, () => {
                res.send({data: "success"});
              });
            }
          }
        }
      })
    }
    res.send({status: "none"});
  } catch (error) {
    console.log("247",error);
    res.sendStatus(500);
  }
})

//app.listen(process.env.PORT || 3000);
app.listen({ port: 80 }, () => {
  console.log(`CoC Dice Bot ready port 80.`);
});
console.log('Starts');

export default app;