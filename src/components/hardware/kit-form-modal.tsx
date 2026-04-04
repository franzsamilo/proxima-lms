"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { createKit, updateKit } from "@/actions/hardware-actions"

interface Kit {
  id: string
  name: string
  level: string
  specs: string
  totalQty: number
  imageEmoji: string
}

interface KitFormModalProps {
  open: boolean
  onClose: () => void
  kit?: Kit | null
}

export function KitFormModal({ open, onClose, kit }: KitFormModalProps) {
  const [name, setName] = React.useState("")
  const [level, setLevel] = React.useState("ELEMENTARY")
  const [specs, setSpecs] = React.useState("")
  const [totalQty, setTotalQty] = React.useState(10)
  const [imageEmoji, setImageEmoji] = React.useState("🤖")
  const [isPending, setIsPending] = React.useState(false)
  const { showToast, toastProps } = useToast()
  const router = useRouter()

  React.useEffect(() => {
    if (kit) {
      setName(kit.name)
      setLevel(kit.level)
      setSpecs(kit.specs)
      setTotalQty(kit.totalQty)
      setImageEmoji(kit.imageEmoji)
    } else {
      setName("")
      setLevel("ELEMENTARY")
      setSpecs("")
      setTotalQty(10)
      setImageEmoji("🤖")
    }
  }, [kit, open])

  async function handleSubmit() {
    setIsPending(true)
    const formData = new FormData()
    formData.set("name", name)
    formData.set("level", level)
    formData.set("specs", specs)
    formData.set("totalQty", String(totalQty))
    formData.set("imageEmoji", imageEmoji)

    const result = kit
      ? await updateKit(kit.id, formData)
      : await createKit(formData)

    if (result?.error) {
      showToast(typeof result.error === "string" ? result.error : "Failed to save", "error")
    } else {
      showToast(kit ? "Kit updated" : "Kit created", "success")
      router.refresh()
      onClose()
    }
    setIsPending(false)
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={kit ? "Edit Hardware Kit" : "New Hardware Kit"}
        footer={
          <>
            <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Saving…" : kit ? "Save Changes" : "Create Kit"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
                Kit Name
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Proxima Scout" />
            </div>
            <div>
              <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
                Emoji
              </label>
              <Input value={imageEmoji} onChange={(e) => setImageEmoji(e.target.value)} className="text-center text-[20px]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
                Level
              </label>
              <Select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="ELEMENTARY">Elementary</option>
                <option value="HS">High School</option>
                <option value="COLLEGE">College</option>
              </Select>
            </div>
            <div>
              <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
                Total Quantity
              </label>
              <Input type="number" value={totalQty} onChange={(e) => setTotalQty(Number(e.target.value))} min={1} />
            </div>
          </div>
          <div>
            <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
              Specifications
            </label>
            <textarea
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              placeholder="Describe the kit components and specifications..."
              className="w-full min-h-[80px] bg-surface-3 border border-edge rounded-[var(--radius-md)] px-3 py-2 font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary placeholder:text-ink-ghost resize-y focus:border-edge-strong focus:ring-[3px] focus:ring-signal-muted focus:outline-none"
            />
          </div>
        </div>
      </Modal>
      <Toast {...toastProps} />
    </>
  )
}
