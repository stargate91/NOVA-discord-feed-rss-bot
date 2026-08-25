import { DiscordRole } from "@/types/guild";
import { useDropdown } from "@/hooks/use_dropdown";
import { discordColorToHex } from "@/utils";

export interface UseRoleSelectOptions {
  roles: DiscordRole[];
  value: string;
  onChange: (value: string) => void;
}

export function useRoleSelect({ roles = [], value, onChange }: UseRoleSelectOptions) {
  const {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    dropdownRef,
    toggleDropdown,
    closeDropdown,
  } = useDropdown({ clearSearchOnClose: false });

  const selectedRole = roles.find((r) => r.id === value);
  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedColor = discordColorToHex(selectedRole?.color, "var(--border-subtle)");

  const handleSelectRole = (roleId: string) => {
    onChange(roleId);
    closeDropdown();
  };

  const handleSelectNone = () => {
    onChange("0");
    closeDropdown();
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

