/**
 * 경남수학문화관 「저울 수학」 문제 은행 — 자동 생성 파일
 *
 *  · 총 100문제 (난이도 1~5단계 × 20문제)
 *  · 모든 문제는 "왼쪽 모멘트 합 = 오른쪽 모멘트 합" 을 만족하도록 검증되었습니다.
 *  · 모멘트 = 무게 × 거리(눈금)
 *
 * 문제를 직접 고치거나 추가하고 싶다면 아래 형식을 그대로 따라 주세요.
 *
 *   id       : 문제 번호
 *   tier     : 난이도 1~5
 *   showDist : true 면 등식에 "무게 × 거리" 를 모두 보여 줍니다 (false 면 무게만)
 *   fixed    : 미리 올려져 있어 움직일 수 없는 추  { left: [[무게,눈금],...], right: [...] }
 *   place    : 아이가 트레이에서 끌어다 놓아야 하는 추 (0번째가 빈칸 □ 에 해당)
 *   blank    : □ 가 가리키는 칸  { side:'right', d: 눈금 }
 *   eq       : 화면 위쪽에 보여 줄 등식 ('□' 가 빈칸)
 *   tray     : 트레이에 놓일 추 값 목록 (정답 추 + 헷갈리게 하는 추)
 */
window.PROBLEMS = [
  /*   1 | 1단계 | 7 + 3 = □ → □=10 */
  {"id":1,"tier":1,"showDist":false,"fixed":{"left":[[7,1],[3,1]],"right":[]},"place":[[10,1]],"blank":{"side":"right","d":1},"eq":{"left":[[7,1],[3,1]],"right":[["□",1]]},"tray":[10,12,11,9]},
  /*   2 | 1단계 | 3 + 6 = □ → □=9 */
  {"id":2,"tier":1,"showDist":false,"fixed":{"left":[[3,1],[6,1]],"right":[]},"place":[[9,1]],"blank":{"side":"right","d":1},"eq":{"left":[[3,1],[6,1]],"right":[["□",1]]},"tray":[9,10,8,11]},
  /*   3 | 1단계 | 2 + 2 = □ → □=4 */
  {"id":3,"tier":1,"showDist":false,"fixed":{"left":[[2,1],[2,1]],"right":[]},"place":[[4,1]],"blank":{"side":"right","d":1},"eq":{"left":[[2,1],[2,1]],"right":[["□",1]]},"tray":[2,4,3,5]},
  /*   4 | 1단계 | 3 + 4 = □ → □=7 */
  {"id":4,"tier":1,"showDist":false,"fixed":{"left":[[3,1],[4,1]],"right":[]},"place":[[7,1]],"blank":{"side":"right","d":1},"eq":{"left":[[3,1],[4,1]],"right":[["□",1]]},"tray":[6,8,5,7]},
  /*   5 | 1단계 | 4 + 2 = □ → □=6 */
  {"id":5,"tier":1,"showDist":false,"fixed":{"left":[[4,1],[2,1]],"right":[]},"place":[[6,1]],"blank":{"side":"right","d":1},"eq":{"left":[[4,1],[2,1]],"right":[["□",1]]},"tray":[5,7,6,4]},
  /*   6 | 1단계 | 6 + 5 = □ → □=11 */
  {"id":6,"tier":1,"showDist":false,"fixed":{"left":[[6,1],[5,1]],"right":[]},"place":[[11,1]],"blank":{"side":"right","d":1},"eq":{"left":[[6,1],[5,1]],"right":[["□",1]]},"tray":[9,11,10,12]},
  /*   7 | 1단계 | 2 + 9 = □ → □=11 */
  {"id":7,"tier":1,"showDist":false,"fixed":{"left":[[2,1],[9,1]],"right":[]},"place":[[11,1]],"blank":{"side":"right","d":1},"eq":{"left":[[2,1],[9,1]],"right":[["□",1]]},"tray":[11,10,9,12]},
  /*   8 | 1단계 | 2 + 3 = □ → □=5 */
  {"id":8,"tier":1,"showDist":false,"fixed":{"left":[[2,1],[3,1]],"right":[]},"place":[[5,1]],"blank":{"side":"right","d":1},"eq":{"left":[[2,1],[3,1]],"right":[["□",1]]},"tray":[4,6,5,7]},
  /*   9 | 1단계 | 5 + 3 = □ → □=8 */
  {"id":9,"tier":1,"showDist":false,"fixed":{"left":[[5,1],[3,1]],"right":[]},"place":[[8,1]],"blank":{"side":"right","d":1},"eq":{"left":[[5,1],[3,1]],"right":[["□",1]]},"tray":[7,10,8,9]},
  /*  10 | 1단계 | 5 + 4 = □ → □=9 */
  {"id":10,"tier":1,"showDist":false,"fixed":{"left":[[5,1],[4,1]],"right":[]},"place":[[9,1]],"blank":{"side":"right","d":1},"eq":{"left":[[5,1],[4,1]],"right":[["□",1]]},"tray":[9,7,8,10]},
  /*  11 | 1단계 | 7 + 2 = □ → □=9 */
  {"id":11,"tier":1,"showDist":false,"fixed":{"left":[[7,1],[2,1]],"right":[]},"place":[[9,1]],"blank":{"side":"right","d":1},"eq":{"left":[[7,1],[2,1]],"right":[["□",1]]},"tray":[10,7,8,9]},
  /*  12 | 1단계 | 3 + 8 = □ → □=11 */
  {"id":12,"tier":1,"showDist":false,"fixed":{"left":[[3,1],[8,1]],"right":[]},"place":[[11,1]],"blank":{"side":"right","d":1},"eq":{"left":[[3,1],[8,1]],"right":[["□",1]]},"tray":[10,11,9,12]},
  /*  13 | 1단계 | 2 + 6 = □ → □=8 */
  {"id":13,"tier":1,"showDist":false,"fixed":{"left":[[2,1],[6,1]],"right":[]},"place":[[8,1]],"blank":{"side":"right","d":1},"eq":{"left":[[2,1],[6,1]],"right":[["□",1]]},"tray":[8,7,10,9]},
  /*  14 | 1단계 | 4 + 4 = □ → □=8 */
  {"id":14,"tier":1,"showDist":false,"fixed":{"left":[[4,1],[4,1]],"right":[]},"place":[[8,1]],"blank":{"side":"right","d":1},"eq":{"left":[[4,1],[4,1]],"right":[["□",1]]},"tray":[8,7,6,9]},
  /*  15 | 1단계 | 2 + 8 = □ → □=10 */
  {"id":15,"tier":1,"showDist":false,"fixed":{"left":[[2,1],[8,1]],"right":[]},"place":[[10,1]],"blank":{"side":"right","d":1},"eq":{"left":[[2,1],[8,1]],"right":[["□",1]]},"tray":[10,9,11,12]},
  /*  16 | 1단계 | 3 + 3 = □ → □=6 */
  {"id":16,"tier":1,"showDist":false,"fixed":{"left":[[3,1],[3,1]],"right":[]},"place":[[6,1]],"blank":{"side":"right","d":1},"eq":{"left":[[3,1],[3,1]],"right":[["□",1]]},"tray":[7,6,5,4]},
  /*  17 | 1단계 | 7 + 4 = □ → □=11 */
  {"id":17,"tier":1,"showDist":false,"fixed":{"left":[[7,1],[4,1]],"right":[]},"place":[[11,1]],"blank":{"side":"right","d":1},"eq":{"left":[[7,1],[4,1]],"right":[["□",1]]},"tray":[9,12,10,11]},
  /*  18 | 1단계 | 4 + 6 = □ → □=10 */
  {"id":18,"tier":1,"showDist":false,"fixed":{"left":[[4,1],[6,1]],"right":[]},"place":[[10,1]],"blank":{"side":"right","d":1},"eq":{"left":[[4,1],[6,1]],"right":[["□",1]]},"tray":[9,12,10,11]},
  /*  19 | 1단계 | 2 + 5 = □ → □=7 */
  {"id":19,"tier":1,"showDist":false,"fixed":{"left":[[2,1],[5,1]],"right":[]},"place":[[7,1]],"blank":{"side":"right","d":1},"eq":{"left":[[2,1],[5,1]],"right":[["□",1]]},"tray":[9,7,6,8]},
  /*  20 | 1단계 | 5 + 5 = □ → □=10 */
  {"id":20,"tier":1,"showDist":false,"fixed":{"left":[[5,1],[5,1]],"right":[]},"place":[[10,1]],"blank":{"side":"right","d":1},"eq":{"left":[[5,1],[5,1]],"right":[["□",1]]},"tray":[11,9,10,12]},
  /*  21 | 2단계 | 8 = □ + 2 → □=6 */
  {"id":21,"tier":2,"showDist":false,"fixed":{"left":[[8,1]],"right":[[2,1]]},"place":[[6,1]],"blank":{"side":"right","d":1},"eq":{"left":[[8,1]],"right":[["□",1],[2,1]]},"tray":[6,7,5,8]},
  /*  22 | 2단계 | 11 = □ + 6 → □=5 */
  {"id":22,"tier":2,"showDist":false,"fixed":{"left":[[11,1]],"right":[[6,1]]},"place":[[5,1]],"blank":{"side":"right","d":1},"eq":{"left":[[11,1]],"right":[["□",1],[6,1]]},"tray":[4,6,3,5]},
  /*  23 | 2단계 | 12 = □ + 7 → □=5 */
  {"id":23,"tier":2,"showDist":false,"fixed":{"left":[[12,1]],"right":[[7,1]]},"place":[[5,1]],"blank":{"side":"right","d":1},"eq":{"left":[[12,1]],"right":[["□",1],[7,1]]},"tray":[6,5,7,4]},
  /*  24 | 2단계 | 9 = □ + 7 → □=2 */
  {"id":24,"tier":2,"showDist":false,"fixed":{"left":[[9,1]],"right":[[7,1]]},"place":[[2,1]],"blank":{"side":"right","d":1},"eq":{"left":[[9,1]],"right":[["□",1],[7,1]]},"tray":[3,2,4,1]},
  /*  25 | 2단계 | 7 = □ + 2 → □=5 */
  {"id":25,"tier":2,"showDist":false,"fixed":{"left":[[7,1]],"right":[[2,1]]},"place":[[5,1]],"blank":{"side":"right","d":1},"eq":{"left":[[7,1]],"right":[["□",1],[2,1]]},"tray":[4,6,7,5]},
  /*  26 | 2단계 | 10 = □ + 6 → □=4 */
  {"id":26,"tier":2,"showDist":false,"fixed":{"left":[[10,1]],"right":[[6,1]]},"place":[[4,1]],"blank":{"side":"right","d":1},"eq":{"left":[[10,1]],"right":[["□",1],[6,1]]},"tray":[4,3,2,5]},
  /*  27 | 2단계 | 12 = □ + 6 → □=6 */
  {"id":27,"tier":2,"showDist":false,"fixed":{"left":[[12,1]],"right":[[6,1]]},"place":[[6,1]],"blank":{"side":"right","d":1},"eq":{"left":[[12,1]],"right":[["□",1],[6,1]]},"tray":[8,5,7,6]},
  /*  28 | 2단계 | 12 = □ + 9 → □=3 */
  {"id":28,"tier":2,"showDist":false,"fixed":{"left":[[12,1]],"right":[[9,1]]},"place":[[3,1]],"blank":{"side":"right","d":1},"eq":{"left":[[12,1]],"right":[["□",1],[9,1]]},"tray":[5,2,3,4]},
  /*  29 | 2단계 | 7 = □ + 4 → □=3 */
  {"id":29,"tier":2,"showDist":false,"fixed":{"left":[[7,1]],"right":[[4,1]]},"place":[[3,1]],"blank":{"side":"right","d":1},"eq":{"left":[[7,1]],"right":[["□",1],[4,1]]},"tray":[3,2,4,5]},
  /*  30 | 2단계 | 9 = □ + 5 → □=4 */
  {"id":30,"tier":2,"showDist":false,"fixed":{"left":[[9,1]],"right":[[5,1]]},"place":[[4,1]],"blank":{"side":"right","d":1},"eq":{"left":[[9,1]],"right":[["□",1],[5,1]]},"tray":[3,5,6,4]},
  /*  31 | 2단계 | 12 = □ + 5 → □=7 */
  {"id":31,"tier":2,"showDist":false,"fixed":{"left":[[12,1]],"right":[[5,1]]},"place":[[7,1]],"blank":{"side":"right","d":1},"eq":{"left":[[12,1]],"right":[["□",1],[5,1]]},"tray":[8,7,9,6]},
  /*  32 | 2단계 | 11 = □ + 9 → □=2 */
  {"id":32,"tier":2,"showDist":false,"fixed":{"left":[[11,1]],"right":[[9,1]]},"place":[[2,1]],"blank":{"side":"right","d":1},"eq":{"left":[[11,1]],"right":[["□",1],[9,1]]},"tray":[4,3,2,1]},
  /*  33 | 2단계 | 9 = □ + 3 → □=6 */
  {"id":33,"tier":2,"showDist":false,"fixed":{"left":[[9,1]],"right":[[3,1]]},"place":[[6,1]],"blank":{"side":"right","d":1},"eq":{"left":[[9,1]],"right":[["□",1],[3,1]]},"tray":[4,5,7,6]},
  /*  34 | 2단계 | 11 = □ + 7 → □=4 */
  {"id":34,"tier":2,"showDist":false,"fixed":{"left":[[11,1]],"right":[[7,1]]},"place":[[4,1]],"blank":{"side":"right","d":1},"eq":{"left":[[11,1]],"right":[["□",1],[7,1]]},"tray":[3,6,4,5]},
  /*  35 | 2단계 | 10 = □ + 7 → □=3 */
  {"id":35,"tier":2,"showDist":false,"fixed":{"left":[[10,1]],"right":[[7,1]]},"place":[[3,1]],"blank":{"side":"right","d":1},"eq":{"left":[[10,1]],"right":[["□",1],[7,1]]},"tray":[2,4,5,3]},
  /*  36 | 2단계 | 4 = □ + 2 → □=2 */
  {"id":36,"tier":2,"showDist":false,"fixed":{"left":[[4,1]],"right":[[2,1]]},"place":[[2,1]],"blank":{"side":"right","d":1},"eq":{"left":[[4,1]],"right":[["□",1],[2,1]]},"tray":[2,4,1,3]},
  /*  37 | 2단계 | 6 = □ + 3 → □=3 */
  {"id":37,"tier":2,"showDist":false,"fixed":{"left":[[6,1]],"right":[[3,1]]},"place":[[3,1]],"blank":{"side":"right","d":1},"eq":{"left":[[6,1]],"right":[["□",1],[3,1]]},"tray":[5,4,2,3]},
  /*  38 | 2단계 | 8 = □ + 4 → □=4 */
  {"id":38,"tier":2,"showDist":false,"fixed":{"left":[[8,1]],"right":[[4,1]]},"place":[[4,1]],"blank":{"side":"right","d":1},"eq":{"left":[[8,1]],"right":[["□",1],[4,1]]},"tray":[5,2,4,3]},
  /*  39 | 2단계 | 10 = □ + 5 → □=5 */
  {"id":39,"tier":2,"showDist":false,"fixed":{"left":[[10,1]],"right":[[5,1]]},"place":[[5,1]],"blank":{"side":"right","d":1},"eq":{"left":[[10,1]],"right":[["□",1],[5,1]]},"tray":[4,6,7,5]},
  /*  40 | 2단계 | 6 = □ + 4 → □=2 */
  {"id":40,"tier":2,"showDist":false,"fixed":{"left":[[6,1]],"right":[[4,1]]},"place":[[2,1]],"blank":{"side":"right","d":1},"eq":{"left":[[6,1]],"right":[["□",1],[4,1]]},"tray":[3,1,2,4]},
  /*  41 | 3단계 | 3 × 4 = □ × 2 → □=6 */
  {"id":41,"tier":3,"showDist":true,"fixed":{"left":[[3,4]],"right":[]},"place":[[6,2]],"blank":{"side":"right","d":2},"eq":{"left":[[3,4]],"right":[["□",2]]},"tray":[10,7,8,9,6]},
  /*  42 | 3단계 | 3 × 2 = □ × 1 → □=6 */
  {"id":42,"tier":3,"showDist":true,"fixed":{"left":[[3,2]],"right":[]},"place":[[6,1]],"blank":{"side":"right","d":1},"eq":{"left":[[3,2]],"right":[["□",1]]},"tray":[4,6,5,8,7]},
  /*  43 | 3단계 | 6 × 2 = □ × 1 → □=12 */
  {"id":43,"tier":3,"showDist":true,"fixed":{"left":[[6,2]],"right":[]},"place":[[12,1]],"blank":{"side":"right","d":1},"eq":{"left":[[6,2]],"right":[["□",1]]},"tray":[10,11,8,9,12]},
  /*  44 | 3단계 | 2 × 4 = □ × 1 → □=8 */
  {"id":44,"tier":3,"showDist":true,"fixed":{"left":[[2,4]],"right":[]},"place":[[8,1]],"blank":{"side":"right","d":1},"eq":{"left":[[2,4]],"right":[["□",1]]},"tray":[7,8,9,6,10]},
  /*  45 | 3단계 | 10 × 1 = □ × 2 → □=5 */
  {"id":45,"tier":3,"showDist":true,"fixed":{"left":[[10,1]],"right":[]},"place":[[5,2]],"blank":{"side":"right","d":2},"eq":{"left":[[10,1]],"right":[["□",2]]},"tray":[9,8,4,5,7]},
  /*  46 | 3단계 | 3 × 3 = □ × 1 → □=9 */
  {"id":46,"tier":3,"showDist":true,"fixed":{"left":[[3,3]],"right":[]},"place":[[9,1]],"blank":{"side":"right","d":1},"eq":{"left":[[3,3]],"right":[["□",1]]},"tray":[7,9,10,11,8]},
  /*  47 | 3단계 | 4 × 2 = □ × 1 → □=8 */
  {"id":47,"tier":3,"showDist":true,"fixed":{"left":[[4,2]],"right":[]},"place":[[8,1]],"blank":{"side":"right","d":1},"eq":{"left":[[4,2]],"right":[["□",1]]},"tray":[8,6,7,10,9]},
  /*  48 | 3단계 | 3 × 4 = □ × 1 → □=12 */
  {"id":48,"tier":3,"showDist":true,"fixed":{"left":[[3,4]],"right":[]},"place":[[12,1]],"blank":{"side":"right","d":1},"eq":{"left":[[3,4]],"right":[["□",1]]},"tray":[12,8,11,9,10]},
  /*  49 | 3단계 | 2 × 4 = □ × 2 → □=4 */
  {"id":49,"tier":3,"showDist":true,"fixed":{"left":[[2,4]],"right":[]},"place":[[4,2]],"blank":{"side":"right","d":2},"eq":{"left":[[2,4]],"right":[["□",2]]},"tray":[6,7,5,9,4]},
  /*  50 | 3단계 | 2 × 5 = □ × 2 → □=5 */
  {"id":50,"tier":3,"showDist":true,"fixed":{"left":[[2,5]],"right":[]},"place":[[5,2]],"blank":{"side":"right","d":2},"eq":{"left":[[2,5]],"right":[["□",2]]},"tray":[5,7,4,8,9]},
  /*  51 | 3단계 | 4 × 4 = □ × 2 → □=8 */
  {"id":51,"tier":3,"showDist":true,"fixed":{"left":[[4,4]],"right":[]},"place":[[8,2]],"blank":{"side":"right","d":2},"eq":{"left":[[4,4]],"right":[["□",2]]},"tray":[9,6,12,8,11]},
  /*  52 | 3단계 | 4 × 3 = □ × 1 → □=12 */
  {"id":52,"tier":3,"showDist":true,"fixed":{"left":[[4,3]],"right":[]},"place":[[12,1]],"blank":{"side":"right","d":1},"eq":{"left":[[4,3]],"right":[["□",1]]},"tray":[10,9,12,11,8]},
  /*  53 | 3단계 | 5 × 2 = □ × 1 → □=10 */
  {"id":53,"tier":3,"showDist":true,"fixed":{"left":[[5,2]],"right":[]},"place":[[10,1]],"blank":{"side":"right","d":1},"eq":{"left":[[5,2]],"right":[["□",1]]},"tray":[12,9,8,11,10]},
  /*  54 | 3단계 | 6 × 3 = □ × 2 → □=9 */
  {"id":54,"tier":3,"showDist":true,"fixed":{"left":[[6,3]],"right":[]},"place":[[9,2]],"blank":{"side":"right","d":2},"eq":{"left":[[6,3]],"right":[["□",2]]},"tray":[12,7,5,9,10]},
  /*  55 | 3단계 | 2 × 3 = □ × 1 → □=6 */
  {"id":55,"tier":3,"showDist":true,"fixed":{"left":[[2,3]],"right":[]},"place":[[6,1]],"blank":{"side":"right","d":1},"eq":{"left":[[2,3]],"right":[["□",1]]},"tray":[8,7,5,6,4]},
  /*  56 | 3단계 | 12 × 1 = □ × 2 → □=6 */
  {"id":56,"tier":3,"showDist":true,"fixed":{"left":[[12,1]],"right":[]},"place":[[6,2]],"blank":{"side":"right","d":2},"eq":{"left":[[12,1]],"right":[["□",2]]},"tray":[9,10,7,8,6]},
  /*  57 | 3단계 | 8 × 1 = □ × 2 → □=4 */
  {"id":57,"tier":3,"showDist":true,"fixed":{"left":[[8,1]],"right":[]},"place":[[4,2]],"blank":{"side":"right","d":2},"eq":{"left":[[8,1]],"right":[["□",2]]},"tray":[3,6,9,7,4]},
  /*  58 | 3단계 | 2 × 2 = □ × 1 → □=4 */
  {"id":58,"tier":3,"showDist":true,"fixed":{"left":[[2,2]],"right":[]},"place":[[4,1]],"blank":{"side":"right","d":1},"eq":{"left":[[2,2]],"right":[["□",1]]},"tray":[5,3,6,4,7]},
  /*  59 | 3단계 | 2 × 5 = □ × 1 → □=10 */
  {"id":59,"tier":3,"showDist":true,"fixed":{"left":[[2,5]],"right":[]},"place":[[10,1]],"blank":{"side":"right","d":1},"eq":{"left":[[2,5]],"right":[["□",1]]},"tray":[11,9,12,8,10]},
  /*  60 | 3단계 | 4 × 3 = □ × 2 → □=6 */
  {"id":60,"tier":3,"showDist":true,"fixed":{"left":[[4,3]],"right":[]},"place":[[6,2]],"blank":{"side":"right","d":2},"eq":{"left":[[4,3]],"right":[["□",2]]},"tray":[9,6,10,5,8]},
  /*  61 | 4단계 | 3 × 5 = □ × 1 + 5 × 2 → □=5 */
  {"id":61,"tier":4,"showDist":true,"fixed":{"left":[[3,5]],"right":[[5,2]]},"place":[[5,1]],"blank":{"side":"right","d":1},"eq":{"left":[[3,5]],"right":[["□",1],[5,2]]},"tray":[5,7,6,4,3]},
  /*  62 | 4단계 | 8 × 2 = □ × 1 + 5 × 2 → □=6 */
  {"id":62,"tier":4,"showDist":true,"fixed":{"left":[[8,2]],"right":[[5,2]]},"place":[[6,1]],"blank":{"side":"right","d":1},"eq":{"left":[[8,2]],"right":[["□",1],[5,2]]},"tray":[4,5,7,6,8]},
  /*  63 | 4단계 | 3 × 1 + 2 × 3 = □ × 1 → □=9 */
  {"id":63,"tier":4,"showDist":true,"fixed":{"left":[[3,1],[2,3]],"right":[]},"place":[[9,1]],"blank":{"side":"right","d":1},"eq":{"left":[[3,1],[2,3]],"right":[["□",1]]},"tray":[10,9,8,11,7]},
  /*  64 | 4단계 | 1 × 3 + 2 × 2 = □ × 1 → □=7 */
  {"id":64,"tier":4,"showDist":true,"fixed":{"left":[[1,3],[2,2]],"right":[]},"place":[[7,1]],"blank":{"side":"right","d":1},"eq":{"left":[[1,3],[2,2]],"right":[["□",1]]},"tray":[6,9,7,8,5]},
  /*  65 | 4단계 | 8 × 3 = □ × 1 + 5 × 3 → □=9 */
  {"id":65,"tier":4,"showDist":true,"fixed":{"left":[[8,3]],"right":[[5,3]]},"place":[[9,1]],"blank":{"side":"right","d":1},"eq":{"left":[[8,3]],"right":[["□",1],[5,3]]},"tray":[9,8,11,10,7]},
  /*  66 | 4단계 | 5 × 1 + 2 × 2 = □ × 1 → □=9 */
  {"id":66,"tier":4,"showDist":true,"fixed":{"left":[[5,1],[2,2]],"right":[]},"place":[[9,1]],"blank":{"side":"right","d":1},"eq":{"left":[[5,1],[2,2]],"right":[["□",1]]},"tray":[8,10,11,7,9]},
  /*  67 | 4단계 | 6 × 4 = □ × 1 + 7 × 2 → □=10 */
  {"id":67,"tier":4,"showDist":true,"fixed":{"left":[[6,4]],"right":[[7,2]]},"place":[[10,1]],"blank":{"side":"right","d":1},"eq":{"left":[[6,4]],"right":[["□",1],[7,2]]},"tray":[12,8,9,10,11]},
  /*  68 | 4단계 | 3 × 3 + 1 × 1 = □ × 1 → □=10 */
  {"id":68,"tier":4,"showDist":true,"fixed":{"left":[[3,3],[1,1]],"right":[]},"place":[[10,1]],"blank":{"side":"right","d":1},"eq":{"left":[[3,3],[1,1]],"right":[["□",1]]},"tray":[11,10,8,12,9]},
  /*  69 | 4단계 | 7 × 3 = □ × 1 + 3 × 5 → □=6 */
  {"id":69,"tier":4,"showDist":true,"fixed":{"left":[[7,3]],"right":[[3,5]]},"place":[[6,1]],"blank":{"side":"right","d":1},"eq":{"left":[[7,3]],"right":[["□",1],[3,5]]},"tray":[4,6,8,5,7]},
  /*  70 | 4단계 | 11 × 2 = □ × 1 + 3 × 5 → □=7 */
  {"id":70,"tier":4,"showDist":true,"fixed":{"left":[[11,2]],"right":[[3,5]]},"place":[[7,1]],"blank":{"side":"right","d":1},"eq":{"left":[[11,2]],"right":[["□",1],[3,5]]},"tray":[6,5,7,9,8]},
  /*  71 | 4단계 | 5 × 3 = □ × 1 + 4 × 2 → □=7 */
  {"id":71,"tier":4,"showDist":true,"fixed":{"left":[[5,3]],"right":[[4,2]]},"place":[[7,1]],"blank":{"side":"right","d":1},"eq":{"left":[[5,3]],"right":[["□",1],[4,2]]},"tray":[8,9,6,5,7]},
  /*  72 | 4단계 | 8 × 2 = □ × 1 + 4 × 2 → □=8 */
  {"id":72,"tier":4,"showDist":true,"fixed":{"left":[[8,2]],"right":[[4,2]]},"place":[[8,1]],"blank":{"side":"right","d":1},"eq":{"left":[[8,2]],"right":[["□",1],[4,2]]},"tray":[7,10,8,9,6]},
  /*  73 | 4단계 | 4 × 3 = □ × 1 + 1 × 4 → □=8 */
  {"id":73,"tier":4,"showDist":true,"fixed":{"left":[[4,3]],"right":[[1,4]]},"place":[[8,1]],"blank":{"side":"right","d":1},"eq":{"left":[[4,3]],"right":[["□",1],[1,4]]},"tray":[7,6,10,8,9]},
  /*  74 | 4단계 | 5 × 4 = □ × 1 + 7 × 2 → □=6 */
  {"id":74,"tier":4,"showDist":true,"fixed":{"left":[[5,4]],"right":[[7,2]]},"place":[[6,1]],"blank":{"side":"right","d":1},"eq":{"left":[[5,4]],"right":[["□",1],[7,2]]},"tray":[5,4,7,6,8]},
  /*  75 | 4단계 | 4 × 4 = □ × 1 + 2 × 3 → □=10 */
  {"id":75,"tier":4,"showDist":true,"fixed":{"left":[[4,4]],"right":[[2,3]]},"place":[[10,1]],"blank":{"side":"right","d":1},"eq":{"left":[[4,4]],"right":[["□",1],[2,3]]},"tray":[8,9,12,11,10]},
  /*  76 | 4단계 | 4 × 1 + 2 × 2 = □ × 1 → □=8 */
  {"id":76,"tier":4,"showDist":true,"fixed":{"left":[[4,1],[2,2]],"right":[]},"place":[[8,1]],"blank":{"side":"right","d":1},"eq":{"left":[[4,1],[2,2]],"right":[["□",1]]},"tray":[9,6,8,10,7]},
  /*  77 | 4단계 | 9 × 2 = □ × 1 + 6 × 2 → □=6 */
  {"id":77,"tier":4,"showDist":true,"fixed":{"left":[[9,2]],"right":[[6,2]]},"place":[[6,1]],"blank":{"side":"right","d":1},"eq":{"left":[[9,2]],"right":[["□",1],[6,2]]},"tray":[8,4,5,6,7]},
  /*  78 | 4단계 | 11 × 3 = □ × 1 + 6 × 4 → □=9 */
  {"id":78,"tier":4,"showDist":true,"fixed":{"left":[[11,3]],"right":[[6,4]]},"place":[[9,1]],"blank":{"side":"right","d":1},"eq":{"left":[[11,3]],"right":[["□",1],[6,4]]},"tray":[7,9,8,10,11]},
  /*  79 | 4단계 | 11 × 4 = □ × 1 + 7 × 5 → □=9 */
  {"id":79,"tier":4,"showDist":true,"fixed":{"left":[[11,4]],"right":[[7,5]]},"place":[[9,1]],"blank":{"side":"right","d":1},"eq":{"left":[[11,4]],"right":[["□",1],[7,5]]},"tray":[8,7,9,10,11]},
  /*  80 | 4단계 | 2 × 4 = □ × 1 + 1 × 3 → □=5 */
  {"id":80,"tier":4,"showDist":true,"fixed":{"left":[[2,4]],"right":[[1,3]]},"place":[[5,1]],"blank":{"side":"right","d":1},"eq":{"left":[[2,4]],"right":[["□",1],[1,3]]},"tray":[5,6,3,7,4]},
  /*  81 | 5단계 | 7 × 1 + 7 × 2 = □ × 1 + 6 × 2 → □=9 */
  {"id":81,"tier":5,"showDist":true,"fixed":{"left":[[7,1],[7,2]],"right":[]},"place":[[9,1],[6,2]],"blank":{"side":"right","d":1},"eq":{"left":[[7,1],[7,2]],"right":[["□",1],[6,2]]},"tray":[6,9,10,8]},
  /*  82 | 5단계 | 4 × 4 + 6 × 1 = □ × 2 + 8 × 1 → □=7 */
  {"id":82,"tier":5,"showDist":true,"fixed":{"left":[[4,4],[6,1]],"right":[]},"place":[[7,2],[8,1]],"blank":{"side":"right","d":2},"eq":{"left":[[4,4],[6,1]],"right":[["□",2],[8,1]]},"tray":[9,8,7,10]},
  /*  83 | 5단계 | 5 × 4 + 3 × 1 = □ × 2 + 7 × 1 → □=8 */
  {"id":83,"tier":5,"showDist":true,"fixed":{"left":[[5,4],[3,1]],"right":[]},"place":[[8,2],[7,1]],"blank":{"side":"right","d":2},"eq":{"left":[[5,4],[3,1]],"right":[["□",2],[7,1]]},"tray":[7,12,8,6]},
  /*  84 | 5단계 | 3 × 3 + 2 × 5 = □ × 2 + 5 × 1 → □=7 */
  {"id":84,"tier":5,"showDist":true,"fixed":{"left":[[3,3],[2,5]],"right":[]},"place":[[7,2],[5,1]],"blank":{"side":"right","d":2},"eq":{"left":[[3,3],[2,5]],"right":[["□",2],[5,1]]},"tray":[7,8,10,5]},
  /*  85 | 5단계 | 9 × 1 + 2 × 3 = □ × 4 + 7 × 1 → □=2 */
  {"id":85,"tier":5,"showDist":true,"fixed":{"left":[[9,1],[2,3]],"right":[]},"place":[[2,4],[7,1]],"blank":{"side":"right","d":4},"eq":{"left":[[9,1],[2,3]],"right":[["□",4],[7,1]]},"tray":[10,7,12,2]},
  /*  86 | 5단계 | 5 × 1 + 2 × 4 = □ × 1 + 2 × 2 → □=9 */
  {"id":86,"tier":5,"showDist":true,"fixed":{"left":[[5,1],[2,4]],"right":[]},"place":[[9,1],[2,2]],"blank":{"side":"right","d":1},"eq":{"left":[[5,1],[2,4]],"right":[["□",1],[2,2]]},"tray":[9,10,8,12,2,6]},
  /*  87 | 5단계 | 2 × 4 + 5 × 3 = □ × 1 + 6 × 2 → □=11 */
  {"id":87,"tier":5,"showDist":true,"fixed":{"left":[[2,4],[5,3]],"right":[]},"place":[[11,1],[6,2]],"blank":{"side":"right","d":1},"eq":{"left":[[2,4],[5,3]],"right":[["□",1],[6,2]]},"tray":[11,6,10,9]},
  /*  88 | 5단계 | 3 × 3 + 8 × 1 = □ × 2 + 9 × 1 → □=4 */
  {"id":88,"tier":5,"showDist":true,"fixed":{"left":[[3,3],[8,1]],"right":[]},"place":[[4,2],[9,1]],"blank":{"side":"right","d":2},"eq":{"left":[[3,3],[8,1]],"right":[["□",2],[9,1]]},"tray":[9,12,6,10,4]},
  /*  89 | 5단계 | 2 × 4 + 5 × 1 = □ × 1 + 2 × 3 → □=7 */
  {"id":89,"tier":5,"showDist":true,"fixed":{"left":[[2,4],[5,1]],"right":[]},"place":[[7,1],[2,3]],"blank":{"side":"right","d":1},"eq":{"left":[[2,4],[5,1]],"right":[["□",1],[2,3]]},"tray":[2,10,8,7,12]},
  /*  90 | 5단계 | 3 × 5 + 2 × 4 = □ × 2 + 9 × 1 → □=7 */
  {"id":90,"tier":5,"showDist":true,"fixed":{"left":[[3,5],[2,4]],"right":[]},"place":[[7,2],[9,1]],"blank":{"side":"right","d":2},"eq":{"left":[[3,5],[2,4]],"right":[["□",2],[9,1]]},"tray":[6,9,7,12]},
  /*  91 | 5단계 | 5 × 3 + 2 × 5 = □ × 1 + 7 × 3 → □=4 */
  {"id":91,"tier":5,"showDist":true,"fixed":{"left":[[5,3],[2,5]],"right":[]},"place":[[4,1],[7,3]],"blank":{"side":"right","d":1},"eq":{"left":[[5,3],[2,5]],"right":[["□",1],[7,3]]},"tray":[12,7,8,4]},
  /*  92 | 5단계 | 2 × 4 + 3 × 3 = □ × 1 + 2 × 4 → □=9 */
  {"id":92,"tier":5,"showDist":true,"fixed":{"left":[[2,4],[3,3]],"right":[]},"place":[[9,1],[2,4]],"blank":{"side":"right","d":1},"eq":{"left":[[2,4],[3,3]],"right":[["□",1],[2,4]]},"tray":[9,12,2,10]},
  /*  93 | 5단계 | 3 × 2 + 7 × 1 = □ × 3 + 4 × 1 → □=3 */
  {"id":93,"tier":5,"showDist":true,"fixed":{"left":[[3,2],[7,1]],"right":[]},"place":[[3,3],[4,1]],"blank":{"side":"right","d":3},"eq":{"left":[[3,2],[7,1]],"right":[["□",3],[4,1]]},"tray":[8,3,12,11,4]},
  /*  94 | 5단계 | 5 × 3 + 8 × 2 = □ × 3 + 4 × 1 → □=9 */
  {"id":94,"tier":5,"showDist":true,"fixed":{"left":[[5,3],[8,2]],"right":[]},"place":[[9,3],[4,1]],"blank":{"side":"right","d":3},"eq":{"left":[[5,3],[8,2]],"right":[["□",3],[4,1]]},"tray":[4,8,12,9]},
  /*  95 | 5단계 | 2 × 1 + 5 × 3 = □ × 2 + 9 × 1 → □=4 */
  {"id":95,"tier":5,"showDist":true,"fixed":{"left":[[2,1],[5,3]],"right":[]},"place":[[4,2],[9,1]],"blank":{"side":"right","d":2},"eq":{"left":[[2,1],[5,3]],"right":[["□",2],[9,1]]},"tray":[12,11,4,10,9]},
  /*  96 | 5단계 | 2 × 3 + 5 × 1 = □ × 3 + 5 × 1 → □=2 */
  {"id":96,"tier":5,"showDist":true,"fixed":{"left":[[2,3],[5,1]],"right":[]},"place":[[2,3],[5,1]],"blank":{"side":"right","d":3},"eq":{"left":[[2,3],[5,1]],"right":[["□",3],[5,1]]},"tray":[2,10,8,12,5]},
  /*  97 | 5단계 | 5 × 2 + 3 × 3 = □ × 1 + 4 × 2 → □=11 */
  {"id":97,"tier":5,"showDist":true,"fixed":{"left":[[5,2],[3,3]],"right":[]},"place":[[11,1],[4,2]],"blank":{"side":"right","d":1},"eq":{"left":[[5,2],[3,3]],"right":[["□",1],[4,2]]},"tray":[6,4,11,10,12]},
  /*  98 | 5단계 | 2 × 4 + 6 × 1 = □ × 3 + 5 × 1 → □=3 */
  {"id":98,"tier":5,"showDist":true,"fixed":{"left":[[2,4],[6,1]],"right":[]},"place":[[3,3],[5,1]],"blank":{"side":"right","d":3},"eq":{"left":[[2,4],[6,1]],"right":[["□",3],[5,1]]},"tray":[12,10,5,3]},
  /*  99 | 5단계 | 7 × 1 + 3 × 5 = □ × 2 + 4 × 1 → □=9 */
  {"id":99,"tier":5,"showDist":true,"fixed":{"left":[[7,1],[3,5]],"right":[]},"place":[[9,2],[4,1]],"blank":{"side":"right","d":2},"eq":{"left":[[7,1],[3,5]],"right":[["□",2],[4,1]]},"tray":[9,8,12,4]},
  /* 100 | 5단계 | 6 × 2 + 4 × 3 = □ × 1 + 7 × 2 → □=10 */
  {"id":100,"tier":5,"showDist":true,"fixed":{"left":[[6,2],[4,3]],"right":[]},"place":[[10,1],[7,2]],"blank":{"side":"right","d":1},"eq":{"left":[[6,2],[4,3]],"right":[["□",1],[7,2]]},"tray":[10,7,9,11]},
];
