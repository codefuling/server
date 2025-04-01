let users = {};  // userId와 socket.id를 매핑

const socketRouter = (io) => {
  io.on("connection", (socket) => {
    console.log(`새로운 연결: ${socket.id}`);
  
    // 사용자 등록 (userId와 socket.id 매핑)
    socket.on("register", (userId) => {
        console.log(`사용자 등록: ${userId} (${socket.id})`);
        users[userId] = socket.id;  // userId와 socket.id를 매핑
    });
  
    // 메시지 수신 (모든 사용자에게 메시지 보내기)
    socket.on("sendMessage", (message) => {
        console.log("모든 사용자에게 메시지 보내기:", message);
        // 스키마에 저장 후 전송


        io.emit("receiveMessage", message);  // 모든 사용자에게 메시지 전송
    });
  
    // 1:1 메시지 수신
    socket.on("sendPrivateMessage", ({ toUserId, message }) => {
        console.log(`타겟 사용자: ${toUserId}`);
        const targetSocketId = users[toUserId];  // 사용자 ID에 해당하는 socket.id 찾기
        if (targetSocketId) {
            console.log(`1:1 메시지 전송: ${toUserId} (${targetSocketId})`);
            io.to(targetSocketId).emit("receivePrivateMessage", message);  // 타겟 사용자에게만 메시지 전송
        } else {
            console.log(`타겟 사용자 없음: ${toUserId}`);
        }
    });
  
    // 연결 종료 시 사용자 제거
    socket.on("disconnect", () => {
        console.log(`연결 종료: ${socket.id}`);
        for (let userId in users) {
            if (users[userId] === socket.id) {
                delete users[userId];  // 연결 종료된 소켓을 목록에서 제거
                break;
            }
        }
    });
  });
}

export default socketRouter;

