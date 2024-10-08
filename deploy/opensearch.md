# Deploying OpenSearch in Kubernetes using Helm

This guide provides instructions for deploying OpenSearch in a Kubernetes cluster using the official Helm chart and attaching it to a persistent volume.

## Prerequisites

- Kubernetes cluster
- Helm 3 installed
- `kubectl` configured to communicate with your cluster

## Steps

1. Add the OpenSearch Helm repository:

   ```sh
   helm repo add opensearch https://opensearch-project.github.io/helm-charts/
   helm repo update
   ```

2. Create a `values.yaml` file to customize the OpenSearch deployment:

   ```yaml
   # values.yaml
   singleNode: true
   
   persistence:
     enabled: true
     storageClass: "hcloud-volumes"  # Replace with your storage class
     size: 20Gi
   
   resources:
     requests:
       cpu: "500m"
       memory: "2Gi"
     limits:
       cpu: "1"
       memory: "4Gi"
   
   opensearchJavaOpts: "-Xmx2g -Xms2g"
   
   config:
     opensearch.yml: |
       discovery.type: single-node
   
   securityConfig:
     enabled: false
   
   service:
     type: ClusterIP
   ```
   Adjust the values according to your needs, especially the `storageClass` to match your cluster's available storage classes.

3. Install OpenSearch using Helm:

   ```sh
   helm install opensearch opensearch/opensearch -f values.yaml -n langwatch
   ```

   Replace `langwatch` with your desired namespace. Create the namespace first if it doesn't exist:

   ```sh
   kubectl create namespace langwatch
   ```

4. Wait for the OpenSearch pod to be ready:

   ```sh
   kubectl get pods -n langwatch -w
   ```

5. To access OpenSearch from other services in the cluster, use the following service name and port:

   ```http://opensearch-cluster-master:9200```

6. If you need to access OpenSearch from outside the cluster, you can set up an Ingress or change the service type to LoadBalancer in the `values.yaml` file.

## Updating the Deployment

To update the OpenSearch deployment after changing `values.yaml`:

```
helm upgrade opensearch opensearch/opensearch -f values.yaml -n langwatch
```

## Cleaning Up

To remove the OpenSearch deployment:

```
helm uninstall opensearch -n langwatch
```

Note: This will not delete the persistent volume. To delete the volume as well, you need to manually delete the PersistentVolumeClaim.

## Troubleshooting

- If the
