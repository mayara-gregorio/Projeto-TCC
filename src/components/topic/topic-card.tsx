export function TopicCard(){
    return (
        <div className="flex flex-col gap-2 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold">Título do Tópico</h3>
            <p className="text-gray-600">Descrição breve do tópico.</p>
            <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">Criado por: Usuário</span>
                <span className="text-sm text-gray-500">Data de criação</span>
            </div>
        </div>
    )
}