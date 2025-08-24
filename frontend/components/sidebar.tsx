import Image from "next/image";
import { Button } from "./ui/button";

export default function Sidebar() {
  //   const [openSidebar, setOpenSidebar] = useState(true);
  //   const toggleSidebar = () => {
  //     setOpenSidebar(!openSidebar);
  //   };
  return (
    <>
      <aside
        className={`sticky top-0 hidden h-screen flex-col overflow-x-hidden overflow-y-auto p-2 md:flex w-full transition-all`}
      >
        <div className="top-0 h-full rounded-2xl p-2 flex flex-col gap-6">
          <Image src="/logo.svg" alt="logo" width={32} height={32} />
          <Button variant="accent" className="text-center w-full" size="lg">
            New Chat
          </Button>
        </div>
      </aside>
    </>
  );
}