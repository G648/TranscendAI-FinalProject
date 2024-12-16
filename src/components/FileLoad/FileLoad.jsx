function FileLoad({ openModalPick }) {
  const handleFileLoadClick = () => {
    openModalPick(); // Abre o modal de seleção de pastas
  };

  return (
    <button
      className=" w-[195px] flex items-center px-4 md:py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 md:absolute md:right-10"
      onClick={handleFileLoadClick}
    >
      <span className="text-2xl mr-2 text-white">+</span>
      <span className="text-white">Carregar arquivos</span>
    </button>
  );
}

export default FileLoad;
