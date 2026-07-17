from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from websocket_manager import alert_ws_manager, station_ws_manager

router = APIRouter(tags=["websockets"])


@router.websocket("/ws/stations")
async def station_updates(websocket: WebSocket) -> None:
    await station_ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        station_ws_manager.disconnect(websocket)


@router.websocket("/ws/alerts")
async def alert_updates(websocket: WebSocket) -> None:
    await alert_ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        alert_ws_manager.disconnect(websocket)
