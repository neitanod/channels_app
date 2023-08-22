defmodule ChannelsAppWeb.RoomChannel do
  use ChannelsAppWeb, :channel

  # This function handles requests to join a specific room.
  def join("room:" <> _room_id, _message, socket) do
    {:ok, socket}
  end

  def handle_in("shout", payload, socket) do
    broadcast! socket, "shout", payload
    {:noreply, socket}
  end

  # Add other functions to handle incoming messages, etc., as needed.
end
