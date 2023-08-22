defmodule ChannelsAppWeb.UserSocket do
  use Phoenix.Socket

  ## Channels
  # channel "some_topic:*", ChannelsAppWeb.SomeChannel

  # This line will enable the handling of WebSocket connections on the "/socket/websocket" path.
  # Modify this as per your requirement. For example, if you want to handle WebSocket connections
  # on a "room" topic, you would write:
  channel "room:*", ChannelsAppWeb.RoomChannel

  ## Transports
  transport :websocket, Phoenix.Transports.WebSocket

  ## Socket Options

  # The default behavior is that the socket will be disconnected after an idle timeout of 1 minute.
  # You can increase or decrease this value as needed.
  @timeout 60_000

  # This function will be called when a new socket connection is initiated. 
  # You can add authentication and other setup logic here if needed.
  def connect(_params, socket, _connect_info) do
    {:ok, socket}
  end

  # This function is called when a socket connection is terminated.
  # You can add cleanup logic here if needed.
  def id(_socket), do: nil
end
