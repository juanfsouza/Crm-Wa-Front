import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";

const Kanban = () => {
  const [cards, setCards] = useState([
    { id: "1", title: "Novo Contato", status: "To Do" },
    { id: "2", title: "Aguardando Resposta", status: "In Progress" },
  ]);

  const columns = ["To Do", "In Progress", "Done"];

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const updatedCards = [...cards];
    const draggedCard = updatedCards.find((card) => card.id === result.draggableId);
    if (draggedCard) {
      draggedCard.status = result.destination.droppableId;
      setCards(updatedCards);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="w-1/3 p-4 bg-gray-100 border-l flex space-x-4">
        {columns.map((col) => (
          <Droppable key={col} droppableId={col}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-1/3 p-4 bg-white shadow-md rounded"
              >
                <h3 className="text-lg font-semibold mb-4 text-black">{col}</h3>
                {cards
                  .filter((card) => card.status === col)
                  .map((card, index) => (
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-4 mb-2 bg-gray-200 shadow-md rounded text-black"
                        >
                          {card.title}
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default Kanban;
