import { useState, useRef } from "react";
import { DiscordRole } from "@/types/guild";
import { useClickOutside, useEscapeKey } from "@/hooks";
import { discordColorToHex } from "@/utils";

export interface UseRoleSelectOptions {
  roles: DiscordRole[];
  value: string;
  onChange: (value: string) => void;
}

export function useRoleSelect({ roles = [], value, onChange }: UseRoleSelectOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedRole = roles.find((r) => r.id === value);
  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);
  useEscapeKey(() => setIsOpen(false), isOpen);

  const selectedColor = discordColorToHex(selectedRole?.color, "var(--border-subtle)");

  const handleSelectRole = (roleId: string) => {
    onChange(roleId);
    setIsOpen(false);
  };

  const handleSelectNone = () => {
    onChange("0");
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    dropdownRef,
    selectedRole,
    filteredRoles,
    selectedColor,
    handleSelectRole,
    handleSelectNone,
    toggleDropdown,
    closeDropdown,
  };
}
