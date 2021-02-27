import websocket
import serial
import time

# reading and writing data from and to arduino serially.
# rfcomm0 -> this could be different
port = serial.Serial("/dev/rfcomm0", baudrate=38400)

try:
    import thread
except ImportError:
    import _thread as thread


def on_message(ws, message):
    print(message)


def on_error(ws, error):
    print(error)


def on_close(ws):
    print("### closed ###")


def on_open(ws):
    def run(*args):
        # test websocket between this python ws.py and NodeJS server.js
        # for i in range(3):
        #     time.sleep(1)
        #     ws.send("Hello %d" % i)

        # read data from bluetooth serial send to websocket
        while True:
            # write data
            # port.write(str(3)) 
            # data = port.readline()
            data = "Sample"
            if data:
                print(data)
                ws.send(data)
        time.sleep(1)
        ws.close()
        print("thread terminating...")
    thread.start_new_thread(run, ())


if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://localhost:8080/",
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)
    ws.on_open = on_open
    ws.run_forever()
