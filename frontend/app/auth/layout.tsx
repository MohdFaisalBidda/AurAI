import GoBack from "@/components/GoBack";
import React from "react";

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <GoBack />
      {children}
    </div>
  );
}

export default layout;
