import java.lang.instrument.Instrumentation;
import java.net.URLClassLoader;
import java.io.*;
import java.util.zip.ZipFile;

public class InitClasspathAgent {
    public static void premain(String agentArgs, Instrumentation inst) {
        String outPath = "/tmp/init-agent-classpath2.txt";
        try (PrintWriter out = new PrintWriter(new FileWriter(outPath, false))) {
            out.println("BEGIN AGENT DUMP");
            out.println("java.version=" + System.getProperty("java.version"));
            out.println("java.home=" + System.getProperty("java.home"));
            out.println("java.class.path=" + System.getProperty("java.class.path"));
            out.println("sun.boot.class.path=" + System.getProperty("sun.boot.class.path"));

            out.println("\nBEGIN CONTEXT CLASSLOADER DUMP");
            ClassLoader cl = Thread.currentThread().getContextClassLoader();
            dumpClassLoader(cl, out);
            out.println("END CONTEXT CLASSLOADER DUMP\n");

            out.println("BEGIN MODULES");
            try {
                java.lang.ModuleLayer boot = java.lang.ModuleLayer.boot();
                for (java.lang.Module m : boot.modules()) {
                    out.println("MODULE=" + m.getName());
                }
            } catch (Throwable t) {
                out.println("MODULES_UNAVAILABLE:" + t.getMessage());
            }
            out.println("END MODULES\n");

            out.println("BEGIN CLASSPATH ENTRY SCAN");
            String cp = System.getProperty("java.class.path");
            if (cp != null) {
                String[] entries = cp.split(System.getProperty("path.separator"));
                for (String e : entries) {
                    out.println("CP_ENTRY=" + e);
                    try {
                        File f = new File(e);
                        if (f.isFile() && f.getName().endsWith(".jar")) {
                            try (ZipFile z = new ZipFile(f)) {
                                boolean multi=false;
                                for (java.util.Enumeration<? extends java.util.zip.ZipEntry> en = z.entries(); en.hasMoreElements();) {
                                    java.util.zip.ZipEntry ze = en.nextElement();
                                    String n = ze.getName();
                                    if (n.startsWith("META-INF/versions/21")) { multi=true; break; }
                                }
                                out.println("  IS_JAR=1 MULTI_RELEASE_21=" + (multi?"YES":"NO"));
                                // find first .class and check major
                                for (java.util.Enumeration<? extends java.util.zip.ZipEntry> en = z.entries(); en.hasMoreElements();) {
                                    java.util.zip.ZipEntry ze = en.nextElement();
                                    String n = ze.getName();
                                    if (n.endsWith(".class")) {
                                        InputStream is = z.getInputStream(ze);
                                        byte[] head = new byte[8];
                                        int r = is.read(head);
                                        is.close();
                                        if (r==8) {
                                            int major = ((head[6]&0xff)<<8) | (head[7]&0xff);
                                            out.println("  FIRST_CLASS="+n+" major="+major);
                                            if (major>=65) {
                                                out.println("  OFFENDING_JAR=YES");
                                            }
                                        }
                                        break;
                                    }
                                }
                            } catch (Throwable zt) {
                                out.println("  JAR_READ_ERROR="+zt.toString());
                            }
                        }
                    } catch (Throwable t) {
                        out.println("  ENTRY_ERROR=" + t.toString());
                    }
                }
            }
            out.println("END CLASSPATH ENTRY SCAN");

            out.println("END AGENT DUMP");
        } catch (Throwable t) {
            try (PrintWriter err = new PrintWriter(new FileWriter("/tmp/init-agent-error2.txt", false))) {
                t.printStackTrace(err);
            } catch (IOException ioe) {
                // ignore
            }
        }
    }

    private static void dumpClassLoader(ClassLoader cl, PrintWriter out) {
        int depth = 0;
        while (cl != null) {
            out.println("CL[" + depth + "]=" + cl.getClass().getName());
            if (cl instanceof URLClassLoader) {
                URLClassLoader ucl = (URLClassLoader) cl;
                for (java.net.URL url : ucl.getURLs()) {
                    out.println("URL[" + depth + "]=" + url);
                }
            } else {
                // try reflection to get 'ucp' for platform/non-URLClassLoader (JDK9+)
                try {
                    java.lang.reflect.Field f = cl.getClass().getDeclaredField("ucp");
                    f.setAccessible(true);
                    Object ucp = f.get(cl);
                    if (ucp != null) {
                        java.lang.reflect.Method m = ucp.getClass().getMethod("getURLs");
                        Object urls = m.invoke(ucp);
                        if (urls instanceof java.net.URL[]) {
                            for (java.net.URL url : (java.net.URL[]) urls) {
                                out.println("REFLECT_URL[" + depth + "]=" + url);
                            }
                        } else if (urls instanceof java.util.List) {
                            for (Object uo : (java.util.List) urls) {
                                out.println("REFLECT_URL[" + depth + "]=" + uo);
                            }
                        }
                    }
                } catch (Throwable ignore) {
                    // nothing
                }
            }
            cl = cl.getParent();
            depth++;
        }
        // also print system classloader
        ClassLoader sys = ClassLoader.getSystemClassLoader();
        out.println("SYSTEM_CLASSLOADER=" + sys.getClass().getName());
    }
}
