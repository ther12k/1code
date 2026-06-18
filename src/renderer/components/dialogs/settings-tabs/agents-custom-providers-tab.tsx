import { useEffect, useState } from "react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { trpc } from "../../../lib/trpc"
import { toast } from "sonner"
import { Plus, Trash2, RefreshCw, CheckCircle2, XCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog"

type PublicProvider = {
  id: string
  name: string
  type: "anthropic" | "openai"
  baseUrl: string
  hasApiKey: boolean
  defaultModel: string | null
  models: string[]
  enabled: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

const EMPTY_FORM = {
  name: "",
  type: "openai" as "anthropic" | "openai",
  baseUrl: "",
  apiKey: "",
  defaultModel: "",
}

export function AgentsCustomProvidersTab() {
  const list = trpc.customProviders.list.useQuery()
  const create = trpc.customProviders.create.useMutation({
    onSuccess: () => {
      list.refetch()
      toast.success("Custom provider added")
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  })
  const remove = trpc.customProviders.delete.useMutation({
    onSuccess: () => {
      list.refetch()
      toast.success("Removed")
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  })
  const testConnection = trpc.customProviders.testConnection.useMutation()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState<PublicProvider | null>(null)
  const [testResults, setTestResults] = useState<
    Record<string, { ok: boolean; models: number; error?: string }>
  >({})

  // Reset test results when list changes
  useEffect(() => {
    setTestResults({})
  }, [list.data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.baseUrl.trim() || !form.apiKey.trim()) {
      toast.error("Name, baseUrl, and apiKey are required")
      return
    }
    try {
      new URL(form.baseUrl)
    } catch {
      toast.error("baseUrl must be a valid URL")
      return
    }
    create.mutate({
      name: form.name.trim(),
      type: form.type,
      baseUrl: form.baseUrl.trim().replace(/\/+$/, ""),
      apiKey: form.apiKey,
      defaultModel: form.defaultModel.trim() || undefined,
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  const handleTest = async (p: PublicProvider) => {
    setTestResults((prev) => ({ ...prev, [p.id]: { ok: false, models: 0 } }))
    try {
      const result = await testConnection.mutateAsync({ id: p.id })
      setTestResults((prev) => ({
        ...prev,
        [p.id]: {
          ok: result.ok,
          models: result.models.length,
          error: result.error,
        },
      }))
      if (result.ok) {
        toast.success(`${p.name}: ${result.models.length} models found`)
        list.refetch()
      } else {
        toast.error(`${p.name}: ${result.error ?? "failed"}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTestResults((prev) => ({
        ...prev,
        [p.id]: { ok: false, models: 0, error: msg },
      }))
      toast.error(`${p.name}: ${msg}`)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Custom Providers</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Route Claude and Codex through your own LLM gateway (9router,
          OpenRouter, LiteLLM, etc.). Credentials are encrypted with
          Electron safeStorage and never leave your machine.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {list.data?.length ?? 0} configured
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="w-4 h-4 mr-1" />
          {showForm ? "Cancel" : "Add provider"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border border-border rounded-lg p-4 space-y-3 bg-card"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cp-name">Name</Label>
              <Input
                id="cp-name"
                placeholder="9router"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cp-type">Protocol</Label>
              <Select
                value={form.type}
                onValueChange={(v: "anthropic" | "openai") =>
                  setForm({ ...form, type: v })
                }
              >
                <SelectTrigger id="cp-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI-compatible</SelectItem>
                  <SelectItem value="anthropic">Anthropic-compatible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="cp-url">Base URL</Label>
            <Input
              id="cp-url"
              type="url"
              placeholder="https://9router.example.com"
              value={form.baseUrl}
              onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cp-key">API Key</Label>
            <Input
              id="cp-key"
              type="password"
              placeholder="sk-..."
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cp-model">Default model (optional)</Label>
            <Input
              id="cp-model"
              placeholder="claude-3-7-sonnet-20250219"
              value={form.defaultModel}
              onChange={(e) =>
                setForm({ ...form, defaultModel: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setForm(EMPTY_FORM)
                setShowForm(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {list.isLoading && (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
        {list.data?.length === 0 && !showForm && (
          <div className="border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
            No custom providers yet. Click "Add provider" to configure one.
          </div>
        )}
        {list.data?.map((p) => {
          const result = testResults[p.id]
          return (
            <div
              key={p.id}
              className="border border-border rounded-lg p-4 bg-card space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{p.name}</h3>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                      {p.type}
                    </span>
                    {!p.enabled && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        disabled
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">
                    {p.baseUrl}
                  </div>
                  {p.defaultModel && (
                    <div className="text-xs text-muted-foreground mt-1">
                      default model: <span className="font-mono">{p.defaultModel}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTest(p)}
                    disabled={testConnection.isPending}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-1 ${
                        testConnection.isPending ? "animate-spin" : ""
                      }`}
                    />
                    Test
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(p)}
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {result && (
                <div className="flex items-center gap-2 text-xs">
                  {result.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-muted-foreground">
                    {result.ok
                      ? `${result.models} models available`
                      : result.error ?? "Connection failed"}
                  </span>
                </div>
              )}
              {p.models.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    {p.models.length} known model{p.models.length === 1 ? "" : "s"}
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.models.map((m) => (
                      <span
                        key={m}
                        className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )
        })}
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete custom provider?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{deleteTarget?.name}" and its encrypted API
              key. Chats using this provider will fall back to defaults.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  remove.mutate({ id: deleteTarget.id })
                  setDeleteTarget(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
